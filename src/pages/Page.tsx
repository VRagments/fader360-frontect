import Nav from '../components/Nav';
import logo from '../logo.svg';
import '../style/App.css';

function Page() {
    return (
        <div>
            <Nav />
            <main className='flex h-full flex-col items-center justify-center bg-slate-800'>
                <header>
                    <p className='text-2xl font-extrabold text-white'>
                        Edit <code>src/App.tsx</code> and save to reload.
                    </p>
                </header>
                <img src={logo} className='App-logo' alt='logo' />
                <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
                    Learn React
                </a>
            </main>
        </div>
    );
}

export default Page;
