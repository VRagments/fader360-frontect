import './style/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import THREEScene from './pages/THREEScene';
import Page from './pages/Page';

function App() {
    return (
        <div className='relative h-full w-full'>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<THREEScene />} />
                    <Route path='page' element={<Page />} />
                    <Route path='*' element={<>Not Found!!</>} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
