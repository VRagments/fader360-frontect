import './style/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Page from './pages/Page';
import Nav from './components/Nav';
import FaderStoryEditor from './pages/FaderStoryEditor';
import FaderStoryViewer from './pages/FaderStoryViewer';

function App() {
    return (
        <div className='flex h-screen w-screen flex-col'>
            <Nav />
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Routes>
                    <Route path='view' element={<FaderStoryViewer />} />
                    <Route path='edit' element={<FaderStoryEditor />}>
                        <Route path=':sceneIdParam' element={<FaderStoryEditor />} />
                    </Route>
                    <Route path='page' element={<Page />} />
                    <Route path='/' element={<Navigate to={'view'} />} />
                    <Route
                        path='*'
                        element={<h1 className='text-white'>File not found! Please pick a different destination via navigation menu</h1>}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
