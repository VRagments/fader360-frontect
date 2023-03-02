import './style/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Page from './pages/Page';
import Nav from './components/Nav';
import FaderStoryEditor from './pages/FaderStoryEditor';

function App() {
    return (
        <div className='relative h-full w-full'>
            <Nav />
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Routes>
                    <Route path='edit' element={<FaderStoryEditor />} />
                    <Route path='page' element={<Page />} />
                    <Route path='*' element={<Navigate to='edit' />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
