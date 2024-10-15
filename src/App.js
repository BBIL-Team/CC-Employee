import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
    const employeeId = '10005315'; 
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noTasksMessage, setNoTasksMessage] = useState(false);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showRemovePopup, setShowRemovePopup] = useState(false);
    const [messagePopup, setMessagePopup] = useState({ show: false, content: '' });
    const [popupTasks, setPopupTasks] = useState([]);

    useEffect(() => {
        fetchTasksForEmployee(employeeId);
    }, []);

    const fetchTasksForEmployee = async (employeeId) => {
        setLoading(true);
        setTasks([]);
        setNoTasksMessage(false);
        try {
            const apiUrl = `https://imf44ag3d4.execute-api.ap-south-1.amazonaws.com/S1/Test5?EmployeeID=${encodeURIComponent(employeeId)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.text();
            if (data.trim() !== '') {
                setTasks(data);
                setNoTasksMessage(false);
            } else {
                setNoTasksMessage(true);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setMessagePopup({ show: true, content: 'Failed to fetch tasks.' });
        } finally {
            setLoading(false);
        }
    };

    const showAddTaskPopup = () => setShowAddPopup(true);
    const showRemoveTaskPopup = () => {
        populatePopupTable();
        setShowRemovePopup(true);
    };

    const closePopup = () => {
        setShowAddPopup(false);
        setShowRemovePopup(false);
        setMessagePopup({ show: false, content: '' });
        setPopupTasks([]);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const params = new URLSearchParams(formData).toString();

        try {
            const response = await fetch(e.target.action, {
                method: e.target.method,
                headers: {
                    'Content-Type': e.target.enctype,
                },
                body: params,
            });

            const result = await response.json();
            setMessagePopup({ show: true, content: result.message });
            closePopup();
            fetchTasksForEmployee(employeeId);
        } catch (error) {
            console.error('Error adding task:', error);
            setMessagePopup({ show: true, content: 'Failed to add task.' });
        }
    };

    const populatePopupTable = () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tasks;
        const rows = tempDiv.querySelectorAll('tr');

        const tasksArray = Array.from(rows).slice(1).map(row => ({
            employeeName: row.children[1]?.innerText || '',
            taskDescription: row.children[2]?.innerText || '',
            startDate: row.children[3]?.innerText || '',
            endDate: row.children[4]?.innerText || '',
            rating: row.children[5]?.innerText || '',
            remarks: row.children[6]?.innerText || '',
            row,
        }));

        setPopupTasks(tasksArray);
    };

    const removeTask = async (employeeName, taskDescription) => {
        const apiUrl = 'https://oje3cr7sy2.execute-api.ap-south-1.amazonaws.com/V1/RemoveTask';
        const plainText = `${employeeName},${taskDescription}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: plainText,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            const data = await response.json();
            setMessagePopup({ show: true, content: data.message || 'Task removed successfully.' });
            fetchTasksForEmployee(employeeId);
        } catch (error) {
            console.error('Error:', error);
            setMessagePopup({ show: true, content: 'Request failed: ' + error.message });
        }
    };

   return (
    <>
        <header>
            <img src="https://www.bharatbiotech.com/images/bharat-biotech-logo.jpg" alt="Company Logo" className="logo" />
        </header>
        <div className="container">
            <h1>Employee Task List</h1>
            {loading && <div id="loading">Loading tasks...</div>}
            <div id="cardContainer" dangerouslySetInnerHTML={{ __html: tasks }} />
            {noTasksMessage && <div id="noTasksMessage">No tasks found for the Employee ID.</div>}
            <div id="buttonContainer">
                <button onClick={showAddTaskPopup}>Add Task</button>&nbsp;&nbsp;
                <button onClick={showRemoveTaskPopup}>Remove Task</button>
            </div>

            {showAddPopup && (
    <>
        <div className="overlay" onClick={closePopup}></div>
        <div className={`popup ${showAddPopup ? 'show' : ''}`}>
            <h3>Add New Task</h3>
            <form id="taskForm" action="https://bi3hh9apo0.execute-api.ap-south-1.amazonaws.com/S1/Addtask" method="POST" onSubmit={handleAddTask}>
                <label htmlFor="employeeID">Employee ID:</label>
                <input type="text" id="employeeID" name="eID" required />
                
                <label htmlFor="employeeName">Employee Name:</label>
                <input type="text" id="employeeName" name="eName" required />
                
                <label htmlFor="taskDescription">Task:</label>
                <input type="text" id="taskDescription" name="TaskDescription" required />
                
                <label htmlFor="StartDate">Start Date:</label>
                <input type="date" id="StartDate" name="StartDate" />
                
                <label htmlFor="EndDate">End Date:</label>
                <input type="date" id="EndDate" name="EndDate" />
                
                <button type="submit">Add</button>
                <button type="button" onClick={closePopup}>Cancel</button>
            </form>
        </div>
    </>
)}

                {showRemovePopup && (
                    <div className="popup1">
                        <h3>Remove Task</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Employee Name</th>
                                    <th>Task Description</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Rating</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {popupTasks.map((task, index) => (
                                    <tr key={index}>
                                        <td>{employeeId}</td>
                                        <td>{task.employeeName}</td>
                                        <td>{task.taskDescription}</td>
                                        <td>{task.startDate}</td>
                                        <td>{task.endDate}</td>
                                        <td>{task.rating}</td>
                                        <td>{task.remarks}</td>
                                        <td>
                                            <button onClick={() => removeTask(task.employeeName, task.taskDescription)}>X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={closePopup}>Close</button>
                    </div>
                )}

                {messagePopup.show && (
                    <div className="popup">
                        <p>{messagePopup.content}</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default App;
