import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="justify-center items-center bg-gradient-to-b from-zinc-600/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:rounded-xl lg:p-4">
      <h1 className='text-lg'>Podstrona nie istnieje</h1>
      <p>Czy na pewno dobrze napisałeś adres?</p>
      <Link href="/" className="text-blue-600">Powrót do strony głównej</Link>
    </div>
  )
}