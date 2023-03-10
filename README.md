# Fader 360 (codependency with new_darth)

## Running new_darth

### Using docker:

(Some of the following steps might be superfluous for non-WSL users)

-   `sudo service postgresql start`
-   `sudo dockerd` (1st shell used)
-   `make clean`
-   `make init-web-assets`
-   `make docker-build`
-   `make docker-refresh-db`
-   `make docker-dev` (2nd shell used)
-   `make proxy` (3d shell used)

-   something something `nix-shell` (not sure were to use it and when not to)

(In case builds are not taking file changes into account)

-   `docker stop $(docker ps -aq) && docker builder prune -af && docker image prune -af && docker system prune -af` (https://stackoverflow.com/questions/35594987/how-to-force-docker-for-a-clean-build-of-an-image#comment113906016_45097423)
-   or go nuclear: `docker system prune` (same link)
-   then rebuild

### Non-docker (not working, nginx?)

-   ...

<br/>

## Running fader360

-   `yarn install && yarn start`

<br/>

## Further Steps

<br/>

### new_darth:

-   browse to `http://localhost:45020` (if proxy running) for new_darth's login page and so forth
-   Register, add a project, add assets, etc

<br/>

### fader360

-   edit `src/devConfig.json` to suit your own login/password data
-   browse to `http://locahost:45020/editor` to reach fader360's editor

<br/>
<br/>
<br/>

### _Original README content from C-R-A:_

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn install`

Installs local dependencies from package.json

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
