type NavProps = {
    storyId: string | null;
};
const Nav = ({ storyId }: NavProps) => {
    return (
        <nav className='mx-auto flex w-full justify-center bg-gray-300 p-1 shadow-md'>
            <a
                className='flex flex-col justify-between items-center mx-1 w-fit cursor-pointer rounded-sm text-sm bg-blue-100 p-2 text-center hover:bg-blue-300'
                href={`view?project_id=${storyId}`}
                target='_blank'
            >
                <div>View Story</div>
                <div className='text-xs'>(opens in new window)</div>
            </a>
        
            <a
                className='flex flex-col justify-between items-center mx-1 w-fit cursor-pointer rounded-sm text-sm bg-blue-100 p-2 text-center hover:bg-blue-300'
                href={`../users/projects/${storyId}`}
            >
                <div className='my-auto'>Back to MV</div>
            </a>
        </nav>
    );
};

export default Nav;
