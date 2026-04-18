import { useState } from 'react';
import { signIn } from '../lib/auth';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      router.push('/add-product');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Login</h1>

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

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full p-2 rounded"
      >
        Login
      </button>
    </div>
  );
}