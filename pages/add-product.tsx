import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/getUser';
import Tesseract from 'tesseract.js';
import Papa from 'papaparse';
import { getUserContext } from '../lib/getUserContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { canUser } from '../lib/permissions';
import { applyRoleFilter } from '../lib/queryHelpers';

export default function AddProduct() {
  console.log("PAGE LOADED");
  const [rows, setRows] = useState([
    { name: '', price: '', gst: '', stock: '', threshold: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<any>({});
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();   
  const [canDelete, setCanDelete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const canAdd = user && canUser(user, 'products', 'add');
  const canEdit = user && canUser(user, 'products', 'update');
  const canDeleteUI = canDelete; // already set

  const fetchProducts = async (query = '') => {
    const user = await getUserContext();
    console.log("USER CONTEXT:", user);
  
    if (!user) return;
  
    // ✅ Base query
    let req = supabase.from('products').select('*');
  
    // ✅ Apply role filter
    req = applyRoleFilter(req, user);
  
    // ✅ Search
    if (query) {
      req = req.ilike('name', `%${query}%`);
    }
  
    // ✅ Sorting
    req = req.order(sortBy, { ascending: true });
  
    // ✅ Execute
    const { data, error } = await req;
  
    if (error) {
      console.error("FETCH ERROR:", error);
      return;
    }
  
    setProducts(data || []);
  };

  const handleDelete = async (id: string) => {
    const user = await getUserContext();
    if (!user) return;

    const allowed = canUser(user,'products','delete');
    if (!allowed) {
      alert("No permission");
      return;
    }
    await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('client_id', user.client_id)
      .eq('branch_id', user.branch_id);
  
    fetchProducts();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const user = await getUserContext();
    if (!user) return;
  
    const allowed = canUser(user,'products','delete');
    if (!allowed) {
      alert("No permission to delete");
      return;
    }

    if (selected.length === 0) {
      alert('No products selected');
      return;
    }
  
    const confirmDelete = confirm('Delete selected products?');
    if (!confirmDelete) return;
  
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', selected)
      .eq('client_id', user.client_id)   // ✅ CRITICAL
      .eq('branch_id', user.branch_id);  // ✅ CRITICAL
  
    if (error) {
      console.error(error);
      alert('Error deleting products');
    } else {
      alert('Deleted successfully');
      setSelected([]);
      fetchProducts();
    }
  };
  
  const handleUpdate = async (id: string) => {
    const user = await getUserContext();
    if (!user) return;
  
    await supabase
      .from('products')
      .update({
        name: editRow.name,
        price: Number(editRow.price),
        stock: Number(editRow.stock),
        low_stock_threshold: Number(editRow.low_stock_threshold)
      })
      .eq('id', id)
      .eq('client_id', user.client_id)
      .eq('branch_id', user.branch_id);
  
    setEditingId(null);
    fetchProducts();
  };

  // 🔹 Add new row
  const addRow = () => {
    setRows([...rows, { name: '', price: '', gst: '', stock: '', threshold: '' }]);
  };

  // Handle CSV upload
  const handleCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setRows(results.data);
      }
    });
  };

  const handleImage = async (file) => {
    const { data } = await Tesseract.recognize(file, 'eng');
  
    console.log(data.text);
    // parse text → convert to rows
  };

  // 🔹 Remove row
  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // 🔹 Handle input change
  const handleChange = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value;
    setRows(newRows);
  };

  // 🔥 Bulk Save
 
  const handleBulkSave = async () => {
    console.log("SAVE CLICKED"); // 👈 ADD HERE (FIRST LINE)
    setLoading(true);
  
    const { data } = await supabase.auth.getUser();
    console.log("AUTH USER:", data.user); // 👈 ADD THIS

    const user = await getUserContext();
    console.log("USER CONTEXT:", user); // 👈 you already have this

    if (!user) {
      console.log("NO USER CONTEXT FOUND");
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const allowed = canUser(user,'products','add');
    if (!allowed) {
      alert("No permission to add");
      return;
    }

    try {
      // ✅ VALIDATE ONCE (OUTSIDE LOOP)
      const invalidRows = rows.filter(r => !r.name || !r.price);
  
      if (invalidRows.length > 0) {
        alert(`Fix ${invalidRows.length} invalid rows before saving`);
        setLoading(false);
        return;
      }
  
      for (const row of rows) {
  
        // 🔍 Check if product exists
        const { data: existing } = await supabase
          .from('products')
          .select('*')
          .eq('name', row.name)
          .eq('client_id', user.client_id)
          .eq('branch_id', user.branch_id)
          .maybeSingle();
  
        if (existing) {
          // 🔄 Update stock
          await supabase
            .from('products')
            .update({
              stock: existing.stock + Number(row.stock),
              low_stock_threshold: Number(
                row.threshold || existing.low_stock_threshold || 10
              )
            })
            .eq('id', existing.id);
  
        } else {
          // ➕ Insert new product
          await supabase.from('products').insert([{
            name: row.name,
            price: Number(row.price),
            gst_rate: Number(row.gst),
            stock: Number(row.stock),
            low_stock_threshold: Number(row.threshold || 10), // ✅ FIXED
            client_id: user.client_id,   // ✅ IMPORTANT
            branch_id: user.branch_id    // ✅ IMPORTANT
          }]);
        }
      }
  
      alert('Products saved!');
  
      // 🔄 Reset grid
      setRows([{ name: '', price: '', gst: '', stock: '', threshold: '' }]);
  
      fetchProducts();
  
    } catch (err) {
      console.error(err);
      alert('Error saving products');
    }
  
    setLoading(false); // ✅ ALWAYS runs
  };

  const isInvalidRow = (row: any) => {
    return !row.name || !row.price;
  };

  useEffect(() => {
    const init = async () => {
    const u = await getUserContext();

    console.log("USER CONTEXT:", u);

    if (!u) {
      router.push('/login');
      return;
    }

    setUser(u); // ✅ store once

    const canDelete = canUser(u, 'products', 'delete');
    setCanDelete(canDelete);

    fetchProducts();
    };

    init();
  }, []);

  {console.log("LOADING STATE:", loading)}

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <div className="bg-white dark:bg-black text-black dark:text-white">
        Test Dark Mode
      </div>
      <button
        onClick={() => document.documentElement.classList.toggle('dark')}
        className="mb-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
      >
        Toggle Theme
      </button>

      {/* 🔍 SEARCH */}
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchProducts(e.target.value);
          }}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
        />

        <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
          <option value="low_stock_threshold">Threshold</option>
        </select>
        <button
          onClick={() => fetchProducts(search)}
          className="bg-gray-200 px-4 rounded"
        >
          Search
        </button>

        {canDelete && (
        <button
          onClick={handleBulkDelete}
          disabled={selected.length === 0}
          className={`px-4 rounded text-white ${
            selected.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600'
          }`}
        >
          Delete Selected ({selected.length})
        </button>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-4">Add Products</h1>
  
      {/* 🔥 Grid */}
      <div className="bg-white p-4 rounded-xl shadow space-y-2">
  
        {/* Header */}
        <div className="grid grid-cols-6 gap-2 font-semibold text-gray-600">
          <div>Name</div>
          <div>Price</div>
          <div>GST %</div>
          <div>Stock</div>
          <div>Threshold</div>
          <div>Action</div>
        </div>
  
        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-6 gap-2 ${
              isInvalidRow(row) ? 'bg-red-50' : ''
            }`}
          >
  
            <input
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                !row.name ? 'border-red-500' : ''
              }`}
              placeholder="Product name"
              value={row.name}
              onChange={e => handleChange(i, 'name', e.target.value)}
            />
  
            <input
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                !row.price ? 'border-red-500' : ''
              }`}
              type="number"
              placeholder="Price"
              value={row.price}
              onChange={e => handleChange(i, 'price', e.target.value)}
            />
  
            <input
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                !row.gst ? 'border-red-500' : ''
              }`}
              type="number"
              placeholder="GST"
              value={row.gst}
              onChange={e => handleChange(i, 'gst', e.target.value)}
            />
  
            <input
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                !row.stock ? 'border-red-500' : ''
              }`}
              type="number"
              placeholder="Stock"
              value={row.stock}
              onChange={e => handleChange(i, 'stock', e.target.value)}
            />

            <input
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                !row.threshold ? 'border-red-500' : ''
              }`}
              type="number"
              placeholder="Threshold"
              value={row.threshold}
              onChange={e => handleChange(i, 'threshold', e.target.value)}
            />

            <button
              onClick={() => removeRow(i)}
              className="bg-red-500 text-white rounded px-2"
            >
              X
            </button>
  
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">

        {canAdd && (
          <button
            onClick={addRow}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            + Add Row
          </button>
        )}

        <button
          onClick={handleBulkSave}
          disabled={loading || !canAdd}
          className={`px-4 py-2 rounded text-white ${
            !canAdd ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
          }`}
        >
          {loading ? 'Saving...' : 'Save All'}
        </button>
      </div>
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];

            console.log("FILE:", file); // 🔍 debug

            if (!file) {
              alert("No file selected");
              return;
            }

            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                console.log("RAW CSV:", results.data); // 🔍 debug

                const cleaned = (results.data as any[])
                  .filter(r => r && (r.name || r.Name))
                  .map((r: any) => ({
                    name: (r.name || r.Name || '').trim(),
                    price: (r.price || r.Price || '').toString().trim(),
                    gst: (r.gst || r.GST || '').toString().trim(),
                    stock: (r.stock || r.Stock || '').toString().trim()
                  }));

                console.log("CLEANED:", cleaned); // 🔍 debug

                if (cleaned.length === 0) {
                  alert("CSV parsed but no valid rows found");
                  return;
                }

                setRows(cleaned); // ✅ THIS SHOULD UPDATE GRID
              },
              error: (err) => {
                console.error("CSV ERROR:", err);
                alert("CSV parsing failed");
              }
            });
            

            // 🔥 IMPORTANT: reset input so same file works again
            e.target.value = '';
          }}
        />      
      </div>

      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Products</h2>
    
        {products.length === 0 && (
          <p className="text-gray-500">No products found</p>
        )}
        {products.map(p => (
          <div
            key={p.id}
            className={`flex justify-between items-center p-3 rounded-lg transition ${
              p.stock === 0
                ? 'bg-red-100'
                : p.stock <= p.low_stock_threshold
                ? 'bg-yellow-50'
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggleSelect(p.id)}
            />

            {editingId === p.id ? (
              <div className="flex gap-2">
                <input
                  value={editRow.name}
                  onChange={e => setEditRow({ ...editRow, name: e.target.value })}
                  className="border p-1"
                />
                <input
                  value={editRow.price}
                  onChange={e => setEditRow({ ...editRow, price: e.target.value })}
                  className="border p-1 w-20"
                />
                <input
                  value={editRow.stock}
                  onChange={e => setEditRow({ ...editRow, stock: e.target.value })}
                  className="border p-1 w-20"
                />
                <input
                  value={editRow.low_stock_threshold}
                  onChange={e =>
                    setEditRow({
                      ...editRow,
                      low_stock_threshold: e.target.value
                    })
                  }
                  className="border p-1 w-20"
                />
              </div>
            ) : (
              <div>
                <strong>{p.name}</strong>
                <div className="text-sm text-gray-500">
                  ₹{p.price} | Stock: {p.stock} | Threshold: {p.low_stock_threshold}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {editingId === p.id && canEdit && (
                <button
                  onClick={() => handleUpdate(p.id)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  Save
                </button>
              )}
            {/* ) : ( */}
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setEditRow(p);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                >
                  Edit
                </button>
              )}
          {/* )} */}
              {canDelete && (
                <button onClick={() => handleDelete(p.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>  
    </div>
  );
}