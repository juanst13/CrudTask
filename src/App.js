import React, { useState, useEffect } from 'react'
import { isEmpty, size } from 'lodash'
import { addDocument, deleteDocument, getCollection, updateDocument } from './actions'

import Headers from './components/Headers'
import Footers from './components/Footers'
import logo from './logo.svg'
import './App.css'

function App() {
  const [task, setTask] = useState("")
  const [responsible, setResponsible] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskUrgence, setTaskUrgence] = useState("")
  const [tasks, setTasks] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [id, setId] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () =>{
      const result = await getCollection("Tasks")
       if(result.statusResponse){
         setTasks(result.data)
       }
    })()
  }, [])

  const validForm = () => {
    let isValid = true
    setError(null)

    if(isEmpty(task) || isEmpty(responsible)|| isEmpty (taskUrgence)){
      setError("Debes ingresar una tarea con la información completa.")
      isValid = false
    }
    return isValid
  }

  const addTask = async(e) => {
    e.preventDefault()

    if(!validForm()){
      return
    }

    const result = await addDocument(
      "Tasks", 
      { name: task, 
        description: taskDescription, 
        responsible: responsible, 
        urgence: taskUrgence  
      })

    if (!result.statusResponse) {
      setError(result.error)
      return
    }

    setTasks([ ...tasks, 
      { id: result.data.id, 
        name: task,
        description: taskDescription, 
        responsible: responsible, 
        urgence: taskUrgence
      } ])
      
    setTask("")
    setTaskDescription("")
    setResponsible("")
    setTaskUrgence("")
  }

  const deleteTask = async(id) => {

    const result = await deleteDocument("Tasks", id)
    if (!result.statusResponse) {
      setError(result.error)
      return
    }

    const filteredTasks = tasks.filter(task => task.id !== id)
    setTasks(filteredTasks)
  }

  const editTask = (theTask) => {
    setTask(theTask.name)
    setTaskDescription(theTask.description)
    setResponsible(theTask.responsible)
    setTaskUrgence(theTask.urgence)
    setEditMode(true)
    setId(theTask.id)
  }

  const saveTask = async(e) => {
    e.preventDefault()

    if(!validForm()){
      return
    }

    const result = await updateDocument(
      "Tasks", 
      id, 
      { name: task, 
        description: taskDescription, 
        responsible: responsible, 
        urgence: taskUrgence  
      })

    if(!result.statusResponse){
      setError = result.error
      return
    }

    const editedTasks = tasks.map(item => item.id === id 
                                          ? { id, 
                                              name: task, 
                                              description: taskDescription, 
                                              responsible: responsible, 
                                              urgence: taskUrgence  
                                            }
                                          : item)
    setTasks(editedTasks)
    setEditMode(false)
    setTask("")
    setId("")
    setTaskDescription("")
    setResponsible("")
    setTaskUrgence("")
  }

  return (
    <div className="container">
      <Headers title={<span className='badge rounded-pill bg-secondary'>Tasks {tasks.length}</span>}/>
      <hr/>
      <div className='row mt-4'>
        <div className='col-md-4'>
          <h4 className='text-center text-white'>
            {editMode ? "Modificar Tarea" : "Agregar Tarea"}
          </h4>
          <form onSubmit={editMode ? saveTask : addTask}>
            {
              error && <span className='text-danger'>{error}</span>
            }
            <input
              type='text'
              className='form-control mb-2'
              placeholder='Ingrese la tarea...'
              onChange= {(text) => setTask(text.target.value) }
              value= {task}
            />
            <input
              type='text'
              className='form-control mb-2'
              placeholder='Responsable...'
              onChange={(text) => setResponsible(text.target.value) }
              value= {responsible}
            />
            <input
              type='text'
              className='form-control mb-2'
              placeholder='Descripción...'
              onChange={(text) => setTaskDescription(text.target.value) }
              value= {taskDescription}
            />
            <select 
              className="form-control mb-2" 
              aria-label="Default select example"
              onChange= {(text) => setTaskUrgence(text.target.value)}
              value = {taskUrgence}
            >
              <option selected>Urgencia</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto</option>
            </select>
            <div className="d-grid gap-2">
              <button 
                className= { editMode ? 'btn btn-warning' : 'btn btn-dark'}
                type='submit'
              >
                {editMode ? "Guardar" : "Agregar"}
              </button>
            </div>
          </form>
          <img src={logo} className="App-logo" alt="logo" /> 
        </div>
        <div className='col-md-8'> 
          {
            size(tasks) === 0 ? (
              <li className='list-group-item'>Aún no hay tareas programadas.</li>
            ) : (
              // <ul className='list-group'>
              // {
              //   tasks.map(task => (
              //     <li className='list-group-item' key={task.id}>
              //       <span className='lead'>{task.name}</span>
              //       <button 
              //         className='btn btn-danger btn-sm float-right mx-2'
              //         onClick={() => deleteTask(task.id)}
              //       >
              //         Eliminar
              //       </button>
              //       <button 
              //         className='btn btn-warning btn-sm float-right mx-2'
              //         onClick={() => editTask(task)}
              //       >
              //         Editar
              //       </button>
              //   </li>
              //   ))
              // }
              // </ul>
              <div className='row'>
                {
                  tasks.map(task => (
                    <div className='col-6'> 
                      <div className="card mt-4" style={{width: "100%"}}>
                        <div className="card-header">
                          <h3>{task.name}</h3>
                          <span className={task.urgence === "Bajo"
                                          ? 'badge rounded-pill bg-primary ml-2'
                                          : task.urgence === "Medio"
                                          ? 'badge rounded-pill bg-warning ml-2'
                                          : 'badge rounded-pill bg-danger ml-2'}
                          >
                            {task.urgence}
                          </span>
                        </div>
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2 text-muted"><mar>{task.responsible}</mar></h6>
                          <p className="card-text">{task.description}</p>
                          <button 
                            className='btn btn-danger btn-sm'
                            onClick={() => deleteTask(task.id)}
                          >
                            Eliminar
                          </button>
                          <button 
                          className='btn btn-warning btn-sm mx-2'
                          onClick={() => editTask(task)}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
      <br/>
      <Footers/>
    </div>
  )
}

export default App
