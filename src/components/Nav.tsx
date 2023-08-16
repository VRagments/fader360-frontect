type NavProps = {
    storyId: string | null;
};
const Nav = ({ storyId }: NavProps) => {
    return (
        <nav className='mx-auto flex w-full justify-center bg-gray-300 p-1 shadow-md'>
            <a
                className='mx-1 flex w-fit cursor-pointer flex-col items-center justify-between rounded-sm bg-blue-100 p-2 text-center text-sm hover:bg-blue-300'
                href={`view?project_id=${storyId}`}
                target='_blank'
            >
                <div>View Story</div>
                <div className='text-xs'>(opens in new window)</div>
            </a>

            <a
                className='mx-1 flex w-fit cursor-pointer flex-col items-center justify-between rounded-sm bg-blue-100 p-2 text-center text-sm hover:bg-blue-300'
                href={`../users/projects/${storyId}`}
            >
                <div className='my-auto'>Back to Project</div>
            </a>
        </nav>
    );
};

export default Nav;
