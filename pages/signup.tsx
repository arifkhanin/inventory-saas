import { useState } from 'react';
import { signUp } from '../lib/auth';
import { useRouter } from 'next/router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [branchName, setBranchName] = useState('');

  const handleSignup = async () => {
    try {
      await signUp(email, password, {
        name,
        companyName,
        branchName
      });
      alert('Account created!');
      router.push('/login');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Signup</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        placeholder="Company Name"
        value={companyName}
        onChange={e => setCompanyName(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        placeholder="Branch Name"
        value={branchName}
        onChange={e => setBranchName(e.target.value)}
        className="border p-2 w-full mb-3"
      />
      <button
        onClick={handleSignup}
        className="bg-green-600 text-white w-full p-2 rounded"
      >
        Sign Up
      </button>
    </div>
  );
}