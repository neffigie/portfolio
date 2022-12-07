"use client"; 
import Link from 'next/link'; 
import Button from '@mui/material/Button';
import Image from 'next/image';
import { Typography } from '@mui/material';

export default function HomePage() {
    return (
        <>
            <h1>Welcome to my portfolio!</h1>
            <hr/>
            <h5>About Me</h5>
            <Image src="https://media-exp1.licdn.com/dms/image/C5603AQHQ3fY2ejn2TQ/profile-displayphoto-shrink_200_200/0/1656787951233?e=1675900800&v=beta&t=WSAzCTy9Vyc_N23CQpwF_0wO3ukXs_A5BUgw_Bvb9qk" alt="me" height="500" width="500"/>
            <Typography variant="body1">Since childhood, I have been invariably captivated by video games, falling in love with their exhilarating display of the arts and novel mechanics. Beyond these superficial traits, however, I firmly believe in its ability to be a powerful conduit of social change. It was in this catalyst that I discovered my passion for software development, and Computer Science, being concerned with the breadth of algorithmic and technical theory behind this field, compellingly asserts itself as its wonderful enabler.
            
            I haven't let the limits of high school academia stop me from this goal: between studying at college to strengthen my grasp of advanced subjects and pursuing an early start to my career, I've chased after this dream like my life depended on it. I've primarily developed skills in C#, Java, Python, HTML5, CSS, jQuery, JavaScript, SQL, Unity Game Engine, Git, Github, and Visual Studio. I've started learning C++ and am always yearning for more languages, algorithms, data structures to add to my collection!</Typography>
            <Link href='./images/resume.png' rel="noopener noreferrer" target="_blank">
                <Button>Open Resume</Button>
            </Link>
        </>
    ); 
}