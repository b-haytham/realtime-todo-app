import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import { Input, Layout, Typography, Tooltip, Button, message } from "antd";
import { CaretUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { socket } from "../utils/socketioClient";

import classes from "../styles/todo.module.css";
import { colors } from "../utils/colors";

const Todo = () => {
    const InputRef = useRef();

    const router = useRouter();

    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState(null);
    const [allTodos, setAllTodos] = useState(null);

    const [input, setInput] = useState("");

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

        socket.on("all-users", (users) => {
            console.log(users);
            setAllUsers(users);
        });
    }, []);

    useEffect(() => {
        fetch("/todos")
            .then((res) => res.json())
            .then((t) => setAllTodos(t))
            .catch(console.log);
    }, []);

    useEffect(() => {
        socket.on("all-todos", (todos) => {
            console.log(todos);
            setAllTodos(todos);
        });
    }, []);

    useEffect(()=>{
        socket.on('todo-deleted', t=> {
            message.warn(`${t.user.username} has deleted todo "${t.text}"`)
        })
    }, [])

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = () => {
        socket.emit("new-todo", input);
    };

    return (
        <Layout className={classes.layout}>
            <Typography.Title className={classes.title}>Todos</Typography.Title>
            {user && (
                <Typography.Paragraph className={classes.username}>
                    {user.username}
                </Typography.Paragraph>
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
                                    style={{ color: colors[i] }}
                                    className={classes.otherUsernames}
                                >
                                    {u.username}
                                </p>
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        backgroundColor: colors[i],
                                        borderRadius: "50%",
                                    }}
                                />
                            </div>
                        ))}
            </div>

            <div className={classes.form}>
                <Input
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
                                        color: findUserColor(
                                            t.user.id,
                                            allUsers,
                                            colors,
                                            user
                                        ),
                                    }}
                                >
                                    {t.user.username}
                                    {": "}
                                </span>
                                {t.text}
                            </p>
                            <Tooltip title="delete Todo">
                                <Button
                                    onClick={()=>{socket.emit('delete-todo', t)}}
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

const findUserColor = (userId, users, colors, currentUser) => {
    let color;

    if (currentUser.id === userId) {
        return "green";
    }

    users
        .filter((u) => u.id === userId)
        .forEach((u, i) => {
            if (u.id === userId) {
                color = colors[i];
            }
        });

    return color;
};

export default Todo;
