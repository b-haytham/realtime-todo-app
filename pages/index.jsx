import { useState, useEffect } from "react";
import { Button, Input, Layout, Typography } from "antd";

import classes from '../styles/Home.module.css'
import { socket } from "../utils/socketioClient";

const Index = () => {
    const [username, setUsername] = useState('')

    useEffect(() => {
      socket.on('welcome', (w)=> {
        console.log(w)
      })
      
    }, [])

    const handleSubmit = () => {

    }

    return <Layout className={classes.layout}> 
            <Typography.Title className={classes.title}>
              Realime Todo App
            </Typography.Title>
          <div className={classes.form}>
            <Input className={classes.input} value={username} onChange={(e)=> setUsername(e.target.value)} />
            <Button className={classes.btn} onClick={handleSubmit}>
              Enter 
            </Button>
        </div>
    </Layout>;
};

export default Index;
