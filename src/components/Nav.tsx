const Nav = () => {
    return (
        <nav className='mx-auto flex w-full justify-center bg-gray-300 p-1 shadow-md'>
            <a className='mx-1 w-24 rounded-sm bg-blue-100 p-2 text-center hover:bg-blue-300' href='view'>
                View Story
            </a>
            <a className='mx-1 w-24 rounded-sm bg-blue-100 p-2 text-center hover:bg-blue-300' href='edit'>
                Edit Story
            </a>
            <a className='mx-1 w-24 rounded-sm bg-blue-100 p-2 text-center hover:bg-blue-300' href='page'>
                A Page
            </a>
        </nav>
    );
};

export default Nav;
