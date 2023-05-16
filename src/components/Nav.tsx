type NavProps = {
    storyId: string | null;
};
const Nav = ({ storyId }: NavProps) => {
    return (
        <nav className='mx-auto flex w-full justify-center bg-gray-300 p-1 shadow-md'>
            <a
                className='mx-1 w-40 cursor-pointer rounded-sm bg-blue-100 p-2 text-center hover:bg-blue-300'
                href={`view?project_id=${storyId}`}
            >
                View Story
            </a>
            <a
                className='mx-1 w-40 cursor-pointer rounded-sm bg-blue-100 p-2 text-center hover:bg-blue-300'
                href={`edit?project_id=${storyId}`}
            >
                Edit Story
            </a>
            <a
                className='mx-1 w-40 cursor-pointer rounded-sm bg-blue-100 p-2 text-center hover:bg-blue-300'
                href={`../users/projects/${storyId}`}
            >
                Back to MV
            </a>
        </nav>
    );
};

export default Nav;
