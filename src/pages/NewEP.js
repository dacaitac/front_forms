import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import Form from '../components/Form'

class NewEP extends React.Component{    
    render() {
        return (
            <div className="container">
                <BrowserRouter >                
                    <Route path="/" component={Form}/>
                </BrowserRouter>
            </div>    
        );
    }
}

export default NewEP;