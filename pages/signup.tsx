import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    plan: "basic",
    branch_name: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (loading) return; // prevents double clicks
  
    setLoading(true);
  
    const {
      client_name,
      contact_name,
      email,
      phone,
      address,
      city,
      pincode,
      branch_name,
      password,
    } = form;
  
    // Basic validation
    if (!client_name || !contact_name || !email || !password || !branch_name) {
      alert("Please fill all required fields");
      setLoading(false); // ✅ FIX
      return;
    }
  
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      setLoading(false); // ✅ FIX
      return;
    }
      // Check if user already exists in users table
    const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

    if (existingUser) {
    alert("Email already registered. Please login.");
    setLoading(false);
    return;
    }  

    // 1. Create Auth User
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    const authUserId = authData.user?.id;

    // 2. Create Client
    const { data: clientData, error: clientError } =
      await supabase
        .from("clients")
        .insert({
          name: client_name,
          contact_name,
          email,
          phone,
          address_line1: address,
          city,
          pincode,
          status: "active",
          plan: form.plan, // 👈 add this
        })
        .select()
        .single();

    if (clientError) {
      alert(clientError.message);
      setLoading(false);
      return;
    }

    // 3. Create Branch
    const { data: branchData, error: branchError } =
      await supabase
        .from("branches")
        .insert({
          name: branch_name,
          client_id: clientData.id,
        })
        .select()
        .single();

    if (branchError) {
      alert(branchError.message);
      setLoading(false);
      return;
    }

    // 4. Create User (super_user)
    const { error: userError } = await supabase
      .from("users")
      .insert({
        auth_user_id: authUserId,
        name: contact_name,
        email,
        client_id: clientData.id,
        branch_id: branchData.id, // ✅ FIXED
        role: "super_user",
      });

    if (userError) {
      alert(userError.message);
      setLoading(false);
      return;
    }

    alert("Account created successfully. Please login.");
    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Client Signup</h1>

      <div className="space-y-3">
        <input name="client_name" placeholder="Client Name" onChange={handleChange} className="border p-2 w-full" />
        <input name="contact_name" placeholder="Contact Person" onChange={handleChange} className="border p-2 w-full" />
        <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full" />
        <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 w-full" />
        <input name="address" placeholder="Address" onChange={handleChange} className="border p-2 w-full" />
        <input name="city" placeholder="City" onChange={handleChange} className="border p-2 w-full" />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} className="border p-2 w-full" />
        <input name="branch_name" placeholder="Branch Name" onChange={handleChange} className="border p-2 w-full" />
        <select
          name="plan"
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full" />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 w-full"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}