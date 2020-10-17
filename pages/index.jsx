import { useState, useEffect } from "react";
import {useRouter} from 'next/router'
import { Button, Input, Layout, Typography } from "antd";


import classes from "../styles/Home.module.css";
import { socket } from "../utils/socketioClient";

const Index = () => {
    const router = useRouter()
    const [username, setUsername] = useState("");

    useEffect(() => {
        socket.on("welcome", (w) => {
            console.log(w);
        });

        socket.on('new-user-success', (u)=> {
          console.log(u)
          router.push(`/todo?u=${u.username}`)
        })

    }, []);

    const handleSubmit = () => {
      if(username.length === 0) return  
      socket.emit('new-user', username)
    };

    return (
        <Layout className={classes.layout}>
            <Typography.Title className={classes.title}>
                Realime Todo App
            </Typography.Title>
            <div className={classes.form}>
                <label className={classes.label} htmlFor="username">
                    {" "}
                    Username{" "}
                </label>
                <Input
                    id="username"
                    className={classes.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Button className={classes.btn} onClick={handleSubmit}>
                    Enter
                </Button>
            </div>
            
        </Layout>
    );
};

export default Index;
