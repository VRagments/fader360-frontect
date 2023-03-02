const Nav = () => {
    return (
        <nav className='mx-auto flex w-full justify-center bg-gray-300 shadow-md'>
            <a className='mx-1 w-16 bg-blue-100 p-2 text-center hover:bg-blue-300' href='edit'>
                3D
            </a>
            <a className='mx-1 w-16 bg-blue-100 p-2 text-center hover:bg-blue-300' href='page'>
                Page
            </a>
        </nav>
    );
};

export default Nav;
