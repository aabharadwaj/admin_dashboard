import React, { useEffect, useState } from 'react'
// eslint-disable-next-line
import admin from './../styles/admin.css'

function Admin() {
    const [userData, setuserData] = useState([])
    const [currentPage, setcurrentPage] = useState(1) // for implementing pagination
    const itemsPerPage = 10;
    const [selectedRows, setSelectedRows] = useState([]); //for recording selected rows
    // eslint-disable-next-line
    const [rowBackgroundColors, setRowBackgroundColors] = useState({}); // for changing background color on click of row
    const [userDataObj, setuserDataObj] = useState({
        userName: "",
        userEmail: "",
        userRole: ""
    }) //for editing data of individual user
    const [editingRows, setEditingRows] = useState({}); // Track editing status for each row
    const [searchTerm, setSearchTerm] = useState('');

    async function getData() {
        let result = await fetch(
            'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'
        );
        let response = await result.json();

        // Filter data based on the search term
        const filteredData = response.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setuserData(filteredData);
    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = userData.slice(indexOfFirstItem, indexOfLastItem);

    // Deleting row data
    const handleDelete = (idx) => {
        let indexToBeDeleted;
        if (currentPage === 1) {
            indexToBeDeleted = idx;
        }
        else {
            indexToBeDeleted = idx + ((currentPage - 1) * itemsPerPage);
        }
        let userDataCopy = [...userData];
        let removedUser = userDataCopy.splice(indexToBeDeleted, 1);
        console.log("Deleted User >>", removedUser[0].name);
        setuserData(userDataCopy);
    }

    //for changing background color and enabling checkbox of selected row on click of row
    const handleRowClick = (userId) => {
        setRowBackgroundColors((prevColors) => {
            return {
                ...prevColors,
                [userId]: "grey",
            };
        });

        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(userId)) {
                // Row is already selected, so unselect it
                return prevSelectedRows.filter((selectedUserId) => selectedUserId !== userId);
            } else {
                // Row is not selected, so select it
                return [...prevSelectedRows, userId];
            }
        });
    }

    const toggleEditingRow = (userId) => {
        setEditingRows((prevEditingRows) => {
            return {
                ...prevEditingRows,
                [userId]: !prevEditingRows[userId],
            };
        });
    };


    const handleEdit = (userId) => {

        // Reset background color to transparent
        setRowBackgroundColors((prevColors) => {
            return {
                ...prevColors,
                [userId]: "transparent",
            };
        });

        // Add logic to handle editing action
        console.log("Editing userID:", userId);
        // Find the user data for the selected row
        const editedUser = userData.find(user => user.id === userId);

        // Update userDataObj with the current values of the row
        setuserDataObj({
            userName: editedUser.name,
            userEmail: editedUser.email,
            userRole: editedUser.role,
        });

        toggleEditingRow(userId);
    };

    const handleSave = (userId) => {
        console.log("userDataObj >>", userDataObj);

        // Reset background color to transparent
        setRowBackgroundColors((prevColors) => {
            return {
                ...prevColors,
                [userId]: "transparent",
            };
        });

        let userDataCopy = [...userData];
        let userDataObjCopy = { ...userDataObj }
        // eslint-disable-next-line
        userDataCopy.map(item => {
            if (item.id === userId) {
                item.name = userDataObjCopy.userName;
                item.email = userDataObjCopy.userEmail;
                item.role = userDataObjCopy.userRole;
            }
        })
        setuserData(userDataCopy);
        console.log("Saving userId:", userId);
        toggleEditingRow(userId);
    };


    const handleMultiRowDelete = () => {
        console.log('Deleted ids of users:', selectedRows);

        // Make a copy of userData
        let userDataCopy = [...userData];

        selectedRows.forEach(userId => {
            // Filter out the user with the specified userId
            userDataCopy = userDataCopy.filter((user) => user.id !== userId);
            setuserData(userDataCopy)
        });

        // Reset selectedRows and rowBackgroundColors after deletion
        setSelectedRows([]);
        setRowBackgroundColors({});
    }

    const renderTableData = () => {
        return (
            currentItems.map((item, idx) => {
                const userId = item.id;
                // return <tr key={idx} onClick={() => handleRowClick(userId)} style={{ backgroundColor: rowBackgroundColors[userId] || 'transparent' }}>
                return <tr key={idx} onClick={() => handleRowClick(userId)} style={{ backgroundColor: 'transparent' }}>
                    <td>
                        <input
                            type='checkbox'
                            checked={selectedRows.includes(userId)}
                            onChange={() => { }}
                        />
                    </td>
                    <td>
                        <input
                            type='text'
                            name='userName'
                            value={editingRows[userId] ? userDataObj.userName : item.name}
                            className='inputStyle'
                            onChange={(e) => setuserDataObj({ ...userDataObj, userName: e.target.value })}
                            disabled={!editingRows[userId]}
                        />
                    </td>
                    <td>
                        <input
                            type='email'
                            name='userEmail'
                            value={editingRows[userId] ? userDataObj.userEmail : item.email}
                            className='inputStyle'
                            onChange={(e) => setuserDataObj({ ...userDataObj, userEmail: e.target.value })}
                            disabled={!editingRows[userId]}
                        /></td>
                    <td>
                        <input
                            type='text'
                            name='userRole'
                            value={editingRows[userId] ? userDataObj.userRole : item.role}
                            className='inputStyle'
                            onChange={(e) => setuserDataObj({ ...userDataObj, userRole: e.target.value })}
                            disabled={!editingRows[userId]}
                        />
                    </td>
                    <td>
                        <button className='editBtn' onClick={() => handleEdit(userId)} disabled={editingRows[userId]}>Edit</button>
                        <button className='saveBtn' onClick={() => handleSave(userId)} disabled={!editingRows[userId]}>Save</button>
                        <button className='delBtn' onClick={() => handleDelete(idx)}>Delete</button>
                    </td>
                </tr>
            })
        )
    }

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(userData.length / itemsPerPage); i++) {

            // for excluding page no #1
            // if (i !== 1) {
            //     pageNumbers.push(
            //         <button key={i} onClick={() => setcurrentPage(i)}>
            //             {i}
            //         </button>
            //     )
            // }

            // for including page no #1
            pageNumbers.push(
                <button key={i} onClick={() => setcurrentPage(i)}>
                    {i}
                </button>
            )
        }
        return pageNumbers;
    }

    return (
        <div className='adminWrap'>

            {/* SEARCH BAR BEGINS */}
            <div className='searchWrap'>
                <input
                    placeholder="Search..."
                    className="searchInput"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className='deleteSelectedBtn' onClick={() => handleMultiRowDelete()}>Delete Selected</button>
            </div>
            {/* SEARCH BAR ENDS */}

            {/* TABLE BEGINS */}
            <div className='tableContainer'>
                <table border="1" cellSpacing="0" cellPadding="0">
                    <thead>
                        <tr>
                            <td></td>
                            <td>Name</td>
                            <td>Email</td>
                            <td>Role</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableData()}
                    </tbody>
                </table>
            </div>
            {/* TABLE ENDS */}

            {/* PAGINATION BEGINS */}
            <div className='paginationWrap'>
                <button onClick={() => setcurrentPage(1)}>
                    first-page
                </button>
                <button onClick={() => setcurrentPage(currentPage > 1 ? currentPage - 1 : 1)}>
                    previous-page
                </button>
                {renderPageNumbers()}
                <button onClick={() => setcurrentPage(currentPage === Math.ceil(userData.length / itemsPerPage) ? currentPage : currentPage + 1)}>
                    next-page
                </button>
                <button onClick={() => setcurrentPage(Math.ceil(userData.length / itemsPerPage))}>
                    last-page
                </button>
            </div>
            {/* PAGINATION ENDS */}
        </div>
    )
}

export default Admin