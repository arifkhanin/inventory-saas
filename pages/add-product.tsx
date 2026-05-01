import { useState, useRef } from 'react';
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
    { id: Date.now(), name: '', price: '', gst_rate: '', stock: '', threshold: '' }
  ]);
  const [devToken, setDevToken] =  useState("");
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  //const [searchBy, setSearchBy] = useState('name');
  const [products, setProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [searchBy, setSearchBy] = useState('name');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<any>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();   
  const [canDelete, setCanDelete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const canAdd = user && canUser(user, 'products.add');
  const canEdit = user && canUser(user, 'products.update');
  const canDeleteUI = canDelete; // already set
  const [mode, setMode] = useState<'view' | 'add' | 'bulk'>('view');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

// Tooling to get token, user on the browser. Useful for testing
const showToken = async () => {
  const { data, error } =
    await supabase.auth.getSession();

  if (error || !data.session) {
    alert("No session found");
    return;
  }

  setDevToken(
    data.session.access_token
  );
};

const clearToken = () => {
  setDevToken("");
};  
  const copyToken = async () => {
    const { data, error } =
      await supabase.auth.getSession();
  
    if (error || !data.session) {
      alert("No session found");
      return;
    }
  
    const token =
      data.session.access_token;
  
    try {
      await navigator.clipboard.writeText(
        token
      );
  
      alert("Token copied");
      return;
    } catch (err) {
      // fallback
    }
  
    try {
      const textarea =
        document.createElement(
          "textarea"
        );
  
      textarea.value = token;
      textarea.style.position =
        "fixed";
      textarea.style.left =
        "-9999px";
  
      document.body.appendChild(
        textarea
      );
  
      textarea.focus();
      textarea.select();
  
      document.execCommand(
        "copy"
      );
  
      document.body.removeChild(
        textarea
      );
  
      alert("Token copied");
    } catch (err) {
      alert(
        "Copy failed. Use Show Token and copy manually."
      );
    }
  };
  
  const showCurrentUser = async () => {
    const { data, error } =
      await supabase.auth.getUser();
  
    if (error || !data.user) {
      alert("No user found");
      return;
    }
  
    alert(
      data.user.email ||
      data.user.id
    );
  };
  //End of tooling

  const fetchProducts = async (query = '') => {
    const user = await getUserContext();
    console.log("USER CONTEXT:", user);
  
    if (!user) return;
  
    // ✅ Base query
    let req = supabase
    .from('products')
    .select('*', { count: 'exact' });
    
    // ✅ Apply role filter
    req = applyRoleFilter(req, user);
  
    // ✅ Search
    if (query) {
      if (searchBy === 'name') {
        req = req.ilike('name', `%${query}%`);
      } else {
        const num = Number(query);
    
        if (!isNaN(num)) {
          req = req.eq(searchBy, num);
        } else {
          alert('Enter a valid number for this search');
          return;
        }
      }
    }
  
    // ✅ Sorting
    req = req.order(sortBy, { ascending: true });
  
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    req = req.range(from, to);

    // ✅ Execute
    const { data, error, count } = await req;
    setTotalCount(count ?? 0);
  
    if (error) {
      console.error("FETCH ERROR:", error);
      return;
    }
  
    setProducts(data || []);
  };

  const handleDelete = async (id: string) => {
    const user = await getUserContext();

    const res = await fetch('/api/products/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, user }),
    });
    
    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }
    setSelected([]);
    setEditingId(null);
    
    fetchProducts(debouncedSearch);
    
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  
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
  
    const allowed = canUser(user,'products.delete');
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
  
    //const user = await getUserContext();

    const res = await fetch('/api/products/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: selected, user }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(text);
      return;
    }

    alert('Deleted successfully');

    setSelected([]);
    setEditingId(null);

    fetchProducts(debouncedSearch);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };
  
  const handleUpdate = async (id: string) => {
    const user = await getUserContext();
    if (!user) return;
  
    // const user = await getUserContext();

    const res = await fetch('/api/products/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        updates: editRow,
        user,
      }),
    });
    
    if (!res.ok) {
      const text = await res.text();
      alert(text);
      return;
    }
    
    setEditingId(null);
    setSelected([]); // 🔥 ADD THIS
    fetchProducts();
    setIsEditOpen(false);
  };

  // 🔹 Add new row
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now() + Math.random(),
        name: '',
        price: '',
        gst_rate: '',
        stock: '',
        threshold: ''
      }
    ]);
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

    const allowed = canUser(user,'products.add');
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

      // 🚀 CALL API
      const res = await fetch('/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows,
          user,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(text);
        setLoading(false);
        return;
      }

      alert('Products saved!');
      setMode('add'); // 🔥 KEEP USER IN ADD TAB
      // 🔄 Reset grid
      setRows([
        { id: Date.now(), name: '', price: '', gst_rate: '', stock: '', threshold: '' }
      ]);

      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);

      setPage(1);
      setSelected([]);
      fetchProducts(debouncedSearch);
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
    (window as any).supabase = supabase;
  }, []);

  useEffect(() => {
    const init = async () => {
    const u = await getUserContext();

    console.log("USER CONTEXT:", u);

    if (!u) {
      router.push('/login');
      return;
    }

    setUser(u); // ✅ store once
    console.log("PERMISSIONS:", u.permissions);

    const canDelete = canUser(u, 'products.delete');
    setCanDelete(canDelete);

    fetchProducts();
    };

    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // ⏳ delay
  
    return () => clearTimeout(timer); // cleanup
  }, [search]);

  useEffect(() => {
    setPage(1); // reset page on new search
  }, [debouncedSearch, searchBy]);

  useEffect(() => {
    if (mode !== 'view') return;
  
    fetchProducts(debouncedSearch);
  
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  
  }, [page, sortBy, debouncedSearch, searchBy, mode]);

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
      {process.env.NODE_ENV ===
        "development" && (
        <div className="mb-4 p-3 border rounded bg-yellow-50">

          <div className="flex gap-2 mb-2">
            <button
              onClick={showToken}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Get Token
            </button>

            <button
              onClick={clearToken}
              className="px-3 py-1 bg-gray-500 text-white rounded"
            >
              Clear
            </button>

            <button
              onClick={showCurrentUser}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Current User
            </button>
          </div>

          {devToken && (
            <input
              value={devToken}
              readOnly
              onFocus={(e) =>
                e.target.select()
              }
              className="w-full border px-2 py-2 text-sm"
            />
          )}

          <div className="text-xs mt-1 text-gray-600">
            Click inside token box,
            Ctrl + A, Ctrl + C
          </div>

        </div>
      )}
      
      <div className="flex gap-2 mb-4">
  
        <button
          onClick={() => {
            setMode('view');
            setPage(1); // reset pagination
          }}
          className={`px-3 py-1 rounded ${mode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          View Products
        </button>

        {canAdd && (
          <button
            onClick={() => {
              setMode('add');
              setPage(1); // reset pagination
            }}
            className={`px-3 py-1 rounded ${mode === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Add Products
          </button>
        )}
      </div>

       {mode === 'add' && (
        <div>
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
                key={row.id}
                className={`grid grid-cols-6 gap-2 ${
                  isInvalidRow(row) ? 'bg-red-50' : ''
                }`}
              >

                <input
                  ref={i === 0 ? firstInputRef : null}
                  className={`border px-3 py-2 ${!row.name ? 'border-red-500' : ''}`}
                  placeholder="Product name"
                  value={row.name}
                  onChange={e => handleChange(i, 'name', e.target.value)}
                />

                <input
                  className={`border px-3 py-2 ${!row.price ? 'border-red-500' : ''}`}
                  type="number"
                  placeholder="Price"
                  value={row.price}
                  onChange={e => handleChange(i, 'price', e.target.value)}
                />

                <input
                  className="border px-3 py-2"
                  type="number"
                  placeholder="GST"
                  value={row.gst_rate}
                  onChange={e => handleChange(i, 'gst_rate', e.target.value)}
                />

                <input
                  className="border px-3 py-2"
                  type="number"
                  placeholder="Stock"
                  value={row.stock}
                  onChange={e => handleChange(i, 'stock', e.target.value)}
                />

                <input
                  className="border px-3 py-2"
                  type="number"
                  placeholder="Threshold"
                  value={row.threshold}
                  onChange={e => handleChange(i, 'threshold', e.target.value)}
                />

                <button
                  onClick={() => removeRow(i)}
                  className="bg-red-500 text-white px-2"
                >
                  X
                </button>

              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">

            <button
              onClick={addRow}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              + Add Row
            </button>

            <button
              onClick={handleBulkSave}
              disabled={loading || !canAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Saving...' : 'Save All'}
            </button>
          </div>

          {/* CSV Upload */}
          <div className="mt-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                Papa.parse(file, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => {
                    const cleaned = (results.data as any[])
                      .filter(r => r && (r.name || r.Name))
                      .map((r: any) => ({
                        id: Date.now() + Math.random(),
                        name: (r.name || r.Name || '').trim(),
                        price: Number(r.price || r.Price || 0),
                        gst_rate: Number(r.gst || r.GST || 0),
                        stock: Number(r.stock || r.Stock || 0),
                        threshold: Number(r.threshold || r.Threshold || 0),
                      }));

                    setRows(cleaned);
                  }
                });

                e.target.value = '';
              }}
            />
          </div>

        </div>
      )}

      {mode === 'view' && (
        <div>

          {/* SEARCH */}
          <div className="mb-4 flex gap-2">
          <input
            ref={searchInputRef}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 w-full"
          />

            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="low_stock_threshold">Threshold</option>
              <option value="gst_rate">GST</option>
            </select>

            {/* <button
              onClick={() => fetchProducts(search)}
              className="bg-gray-200 px-4"
            >
              Search
            </button> */}

            {canDelete && (
              <button
                onClick={handleBulkDelete}
                disabled={selected.length === 0}
                className={`px-4 text-white ${
                  selected.length === 0 ? 'bg-gray-400' : 'bg-red-600'
                }`}
              >
                Delete Selected ({selected.length})
              </button>
            )}
          </div>

          {/* PRODUCT LIST */}
          <div className="mt-6 bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Products</h2>

            {products.length === 0 && (
              <p className="text-gray-500">No products found</p>
            )}

            {products.map(p => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                />

                <div>
                  <strong>{p.name}</strong>
                  <div className="text-sm text-gray-500">
                    ₹{p.price} | Stock: {p.stock} | Threshold: {p.low_stock_threshold}
                  </div>
                </div>

                <div className="flex gap-2">
                  {canEdit && (
                    <button
                    onClick={() => {
                      setEditingId(p.id);
                    
                      setEditRow({
                        name: p.name || '',
                        price: p.price ?? '',
                        gst_rate: p.gst_rate ?? '',
                        stock: p.stock ?? '',
                        low_stock_threshold: p.low_stock_threshold ?? ''
                      });
                    
                      setIsEditOpen(true);
                    }}
                      className="bg-blue-600 text-white px-3"
                    >
                      Edit
                    </button>
                  )}

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
      )}

      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Product</h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  value={editRow.name || ''}
                  onChange={e => setEditRow({ ...editRow, name: e.target.value })}
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  value={editRow.price || ''}
                  onChange={e => setEditRow({ ...editRow, price: e.target.value })}
                  type="number"
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GST (%)</label>
                <input
                  value={editRow.gst_rate || ''}
                  onChange={e => setEditRow({ ...editRow, gst_rate: e.target.value })}
                  type="number"
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                <input
                  value={editRow.stock || ''}
                  onChange={e => setEditRow({ ...editRow, stock: e.target.value })}
                  type="number"
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                <input
                  value={editRow.low_stock_threshold || ''}
                  onChange={e =>
                    setEditRow({
                      ...editRow,
                      low_stock_threshold: e.target.value
                    })
                  }
                  type="number"
                  className="border w-full px-3 py-2 rounded"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleUpdate(editingId!);
                  setIsEditOpen(false);
                }}
                disabled={
                  !editRow.name?.trim() ||
                  editRow.price === '' ||
                  editRow.price === null ||
                  editRow.price === undefined
                }
                className={`px-4 py-2 rounded text-white ${
                  !editRow.name?.trim() || editRow.price === ''
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600'
                }`}
              >
                Save
              </button>
            </div>
            
          </div>

          
        </div>
      )}  
      {mode === 'view' && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Page {page} of {Math.ceil(totalCount / pageSize) || 1}
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              onClick={() =>
                setPage(prev =>
                  prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
                )
              }
              disabled={page >= Math.ceil(totalCount / pageSize)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>

          </div>
        </div> 
      )} 
    </div>
  );
}