import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { MathUtils } from 'three';
import Nav from '../components/Nav';
import '../style/App.css';

function THREEScene() {
    return (
        <div>
            <Nav />
            <div className='flex  flex-col items-center justify-center bg-slate-800'>
                <div className='h-[48rem] w-4/5 p-10'>
                    <Canvas>
                        <perspectiveCamera />
                        <OrbitControls />
                        <ambientLight intensity={5000} />
                        <directionalLight color={'white'} intensity={100} />
                        <mesh rotation={[MathUtils.degToRad(30), MathUtils.degToRad(-30), 0]}>
                            <torusGeometry args={[5, 1.5, 16, 32]} />
                            <meshStandardMaterial color={'green'} metalness={1} roughness={0.2} />
                        </mesh>
                        <Environment background preset='sunset' />
                    </Canvas>
                </div>
            </div>
        </div>
    );
}

export default THREEScene;
