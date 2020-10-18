import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import { Input, Layout, Typography, Tooltip, Button, message } from "antd";
import {
    CaretUpOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";

import { socket } from "../utils/socketioClient";

import classes from "../styles/todo.module.css";
import { useWindowSize } from "../utils/useWindowSize";
import { colors } from "../utils/colors";

const Todo = () => {
    const InputRef = useRef();

    const router = useRouter();

    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState(null);
    const [allTodos, setAllTodos] = useState(null);
    const [pos, setPos] = useState(null);

    const { width, height } = useWindowSize();

    const [input, setInput] = useState("");

    useEffect(() => {
        // const width = window.innerWidth
        // const height = window.innerHeight
        window.addEventListener("mousemove", (e) => {
            const position = {
                x: `${(e.clientX / width) * 100}%`,
                y: `${(e.clientY / height) * 100}%`,
            };

            socket.emit("position", {
                userId: socket.id,
                position,
            });
        });
    }, [width, height]);

    useEffect(() => {
        socket.on("position", (p) => {
            console.log(p);
            setPos(p);
        });
    }, [pos]);

    useEffect(() => {
        socket.emit("get-user", router.query.u);

        socket.on("get-user", (u) => {
            setUser(u);
        });
    }, [router]);

    useEffect(() => {
        fetch("/users")
            .then((res) => res.json())
            .then((u) => setAllUsers(u))
            .catch(console.log);

        fetch("/todos")
            .then((res) => res.json())
            .then((t) => setAllTodos(t))
            .catch(console.log);
    }, []);

    useEffect(() => {
        socket.on("all-users", (users) => {
            console.log(users);
            setAllUsers(users);
        });
    }, []);

    useEffect(() => {
        socket.on("all-todos", (todos) => {
            console.log(todos);
            setAllTodos(todos);
        });
    }, []);

    useEffect(() => {
        socket.on("todo-deleted", (t) => {
            message.warn(`${t.user.username} has deleted todo "${t.text}"`);
        });
    }, []);

    useEffect(() => {
        socket.on("input-changed", (v) => {
            setInput(v)
        });
    }, []);

    useEffect(()=>{
        InputRef.current.onFocus = (e) => {
            socket.emit('focus-input', true)
        }


        socket.on('input-focused', (f)=> {
            InputRef.current.focus()
        })
    },[InputRef])


    const handleInputChange = (e) => {

        setInput(e.target.value);
        socket.emit('change-input-value', e.target.value)
    };

    const handleSubmit = () => {
        socket.emit('change-input-value', '')
        socket.emit("new-todo", input);
        setInput('')
    };

    return (
        <Layout className={classes.layout}>
            <Typography.Title className={classes.title}>Todos</Typography.Title>
            {user && (
                <Typography.Paragraph className={classes.username}>
                    {user.username}
                </Typography.Paragraph>
            )}
            {pos && (
                    <>
                        <span
                            style={{
                                position: "absolute",
                                top: pos.position.y,
                                left: pos.position.x,
                                zIndex: 200,
                            }}
                            className={classes.badge}
                        >
                            {pos.username}
                        </span>
                        <CaretUpOutlined
                            style={{
                                color: "red",
                                zIndex: "100",
                                position: "absolute",
                                top: `calc(${pos.position.y} - 7px)`,
                                left: `calc(${pos.position.x} - 7px)`,
                            }}
                        />
                    </>
                )}

            <div className={classes.otherUsers}>
                {allUsers &&
                    allUsers
                        .filter((u) => u.username !== user.username)
                        .map((u, i) => (
                            <div
                                key={u.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "8px 0",
                                }}
                            >
                                <p
                                    style={{ color: "#008080" }}
                                    className={classes.otherUsernames}
                                >
                                    {u.username}
                                </p>
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        backgroundColor: "#008080",
                                        borderRadius: "50%",
                                    }}
                                />
                            </div>
                        ))}
            </div>

            <div className={classes.form}>
                <Input
                    ref={InputRef}
                    className={classes.input}
                    value={input}
                    onChange={handleInputChange}
                />
                <Tooltip title="add Todo">
                    <Button
                        onClick={handleSubmit}
                        className={classes.btn}
                        shape="circle"
                        icon={<PlusOutlined />}
                    />
                </Tooltip>
            </div>

            <div className={classes.todos}>
                {allTodos &&
                    allTodos.map((t, i) => (
                        <div key={t.id} className={classes.singleTodo}>
                            <p className={classes.todoText}>
                                <span
                                    className={classes.span}
                                    style={{
                                        color:
                                            t.user.username === user.username
                                                ? "green"
                                                : "#008080",
                                    }}
                                >
                                    {t.user.username}
                                    {": "}
                                </span>
                                {t.text}
                            </p>
                            <Tooltip title="delete Todo">
                                <Button
                                    onClick={() => {
                                        socket.emit("delete-todo", t);
                                    }}
                                    className={classes.btn}
                                    shape="circle"
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </div>
                    ))}
            </div>
        </Layout>
    );
};


export default Todo;
