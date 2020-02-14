import React from 'react'
import { MDBRow, MDBCol, MDBBtn } from "mdbreact";
import referal from '../assets/referal.json'
import careers from '../assets/careers.json'
import exps from '../assets/exps.json'
import '../styles/Form.css'
import conf from '../config.json'

const fetch = require('node-fetch');

const url = conf.backURL + conf.port
let universities = {}
let referals = {}
let why = {}

let error = ""

class Form extends React.Component{    
    constructor(props){
        super(props)
        this.state = {
            form:{
                name:       {value: ''},
                lastName:   {value: ''},
                email:      {value: ''},
                pass:       {value: ''},
                phone:      {value: ''},
                university: {value: ''},
                exp:        {value: ''},
                referal:    {value: ''},
                prom_code:  {value: ' '},
                lc:         {value: ''},
                career:     {value: ''},
                englishLevel:{value: ''},
                selected_program: {value: ''},
                utm_source: {value: '' },
                utm_medium: {value: '' },
                utm_campaign: {value: ''},
                utm_term: {value: ''},
                utm_content: {value: ''}
            },
            title : '',
            className : '',
            params: ' ',
            program: this.props.program,
            loading: true,
            arrUniversities: [],
            arrRefs: [],
            arrExps: [],
            arrCars: [],
            error: 0,
            check: false
        };
        
        this.changeHandler = this.changeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }    
    
    componentDidMount() {
        // Se separan todos los parametros que hayan llegado por URL
        let params  = this.props.location.search
        let tform   = this.state.form   
        let pars    = params.substring(1).split('&')
        let arg     = ""
        let val     = ""
        let prog    = ""
        
        // Acá solo identifica que programa es según el parametro /?form=##
        pars.map(par => {
            arg = par.split('=')[0]
            val = par.split('=')[1]
            prog = (arg === "form") ? val : prog
        })      
        
        // Se cargan atributos unicos por programa en el estado de la pag
        switch (prog) {
            case "gv":
                tform.selected_program = { value: ['1'] }
                this.setState({
                    form: tform,
                    program: "gv",
                    title: "Voluntario Global",
                    className: "titleGV"
                })
                break;
            case "gt":
                    tform.selected_program = { value: ['2'] }
                    this.setState({
                        form: tform,
                        program: "gt",
                        title: "Talento Global",
                        className: "titleGT"
                    })
                break;
            case "ge":
                    tform.selected_program = { value: ['5'] }
                    this.setState({
                        form: tform,
                        program: "ge",
                        title: "Emprendedor Global",
                        className: "titleGE"
                    })
                break;
            default:
                break;
        }

        this.fetchData() // Se llaman los datos de los dropdown desde el back
    }
    
    //Llama los datos que estan en un servicio externo para mostrarlos en los dropdown
    fetchData = async () => {        
        this.setState({
            loading: true,
            error: null
        })        
        try {
            //Llama los datos para alimentar los dropdown
            universities = await fetch(url+"/universities").then(res => res.json()) 
            universities = universities.filter( (item, pos) => universities.indexOf(item) === pos)
            referals = await fetch(url+"/referals?pg="+this.state.program).then(res => res.json())
            referals = referals.filter( (item, pos) => referals.indexOf(item) === pos)
            why     = await fetch(url+"/whys?pg="+this.state.program).then(res => res.json())
            why     = why.filter( (item, pos) => why.indexOf(item) === pos)

            
            //Cuando ya tiene los datos los guarda en los atributos estado de la pagina
            //Los datos de cada dropdown deben quedar en un arreglo            
            this.setState({
                loading: false,
                arrUniversities: universities.sort(),
                lc: universities,
                arrRefs: referals,
                arrExps: why,
                arrCars: careers.cars,
            })
        } catch (error) {
            this.setState({
                loading: false,
                error: error
            })
        }
    }   

    handleSubmit = async e => {
        e.preventDefault();
        let tform = this.state.form

        // -------- Parametros UTM --------
        // Lee todos los parametros que estén en la URL para enviarlos al back
        let params = this.props.location.search
        let pars = params.substring(1).split('&')
        let arg = ""
        let val = ""
        let prog = ""
        let utm_source = " "
        let utm_medium = " "
        let utm_campaign = " "
        let utm_term = " "
        let utm_content = " "

        pars.map(par => {
            arg = par.split('=')[0]
            val = par.split('=')[1]
            prog = (arg === "form") ? val : prog
            utm_source = (arg === "utm_source") ? val : utm_source
            utm_medium = (arg === "utm_medium") ? val : utm_medium
            utm_campaign = (arg === "utm_campaign") ? val : utm_campaign
            utm_term = (arg === "utm_term") ? val : utm_term
            utm_content = (arg === "utm_content") ? val : utm_content
        })

        tform.utm_source.value = utm_source 
        tform.utm_medium.value = utm_medium 
        tform.utm_campaign.value = utm_campaign
        tform.utm_term.value = utm_term
        tform.utm_content.value = utm_content
        // ------- Fin parametros UTM --------
        
        // Validaciones
        let uni = this.state.form.university.value
        let exp = this.state.form.exp.value
        let llg = this.state.form.referal.value
        let deg = this.state.form.career.value
        
        uni = (uni === "Universidad") ? "" : uni
        exp = (exp === "Quiero vivir mi experiencia porque...") ? "" : exp
        llg = (llg === "Llegué acá por...") ? "" : llg
        deg = (deg === "Carrera") ? "" : deg
        // Fin validaciones
        
        this.setState({ tform }); // Carga todos los datos del formulario

        if( uni === "" || exp === "" || llg === "" || deg === ""){
            error = "Debes llenar todos los campos."
            this.setState({error: 2})
        }
        else {
            let getURL = url + '/' +this.state.program
            
            // Envía el formulario
            await fetch(getURL, {
                method: 'POST',
                mode: 'cors',            
                body: JSON.stringify({...this.state.form}),
                headers: 
                    {'Accept': 'application/json', 'Content-Type': 'application/json; charset=UTF-8"'},
            }).then(res => {    
                if(res.status == 422){ // Manejo de errores desde EXPA
                    error = "Este correo ya se encuentra registrado."
                    this.setState({error: 2})
                }else{
                    this.setState({error: 1, check: "true"})
                    error = "Te has registrado exitosamente."
                    window.location.href  = "https://aieseccolombia.org" // Si el registro fue exitoso redirecciona a 
                }
            })
            .catch(err => { // Manejo de errores desde el servidor back
                error = "Ha ocurrido un error, intentalo de nuevo más tarde."
                this.setState({error: 2})
            })
        }
    }         

    // Esta función se encarga de leer los cambios en el formulario en cada cambio que le haga el usuario
    // Los datos quedan en las variables estado de la pagina
    changeHandler = event => {              
        const name = event.target.name;
        const value = event.target.value;    
                    
        this.setState({
          form: {
              ...this.state.form,
              [name]: {
              ...this.state.form[name],
              value
            }
          },
          error: 0
        });

        if(name === "pass"){
            this.setState({error: 3})
            error = "La contraseña debe:"
        }
    }

    render() {
        const getParams = ""
        let code = ""
        if(getParams === "yes")
            code = <input  type="input"
                    className="form-control"
                    name="prom_code"
                    placeholder="Código de promoción"
                    pattern="[0-9]*$"
                    onChange={this.changeHandler} />
                
        
        if(this.state.loading === true){
            return 'Loading Universities...'
        }
        
        let listUs = this.state.arrUniversities;
        let opU = listUs.map( u => 
            <option key={u}>{u}</option>
        )

        let listRfs = this.state.arrRefs;
        let opRfs = listRfs.map( u => 
            <option key={u}>{u}</option>
        )

        let listXps = this.state.arrExps;
        let opXps = listXps.map( u => 
            <option key={u}>{u}</option>
        )

        let listCars = this.state.arrCars;
        let opCar = listCars.map( u => 
            <option key={u}>{u}</option>
        )

        let deg = ""
        let engLvl = ""
        let gte = this.state.program === "gt" | this.state.program === "ge"        

        if( gte ){
            engLvl = <select className="form-control"
                        name="englishLevel"
                        onChange={this.changeHandler}>  
                        <option  defaultValue>Nivel de Inglés</option>
                        <option>Básico</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                    </select>
        }

        let err = this.state.error
        
        switch (err) {
            case 0:
                alert = ""  
            break;
            case 1:
                alert = <div className="alert alert-success" role="alert">
                {error}
                </div>    
            break;
            case 2:
                alert = <div className="alert alert-danger" role="alert">
                {error}
                </div>
            break;
            case 3:
                alert = <div className="alert alert-warning" role="alert">
                {error}
                    <ul>
                        <li>Tener mínimo 8 caracteres.</li>
                        <li>Al menos una letra minúscula.</li>
                        <li>Al menos una letra mayúscula.</li>
                        <li>Al menos un dígito.</li>
                    </ul>
                </div>
            break;
        
            default:
                break;
        }


        let title = this.state.title

        return (
            <div>
                <div>{alert}</div>
                <div className="form-group container">
                    <h2 className="header" id={this.state.className}>{title}</h2>
                    <div className="col s12 m12">{this.props.desc}</div>
                </div>     

                <form onSubmit = {this.handleSubmit} >                    
                    <MDBRow>                        
                        <MDBCol md="6" className="mb-3">
                            <input  type="text" 
                                    name="name"
                                    className="form-control" 
                                    placeholder="Nombre"
                                    onChange={this.changeHandler}
                                    required
                            />                            
                        </MDBCol>
                        
                        <div className="form-group col-md-6">
                            <input  type="text" 
                                    name="lastName"
                                    className="form-control" 
                                    placeholder="Apellido" 
                                    onChange={this.changeHandler}
                                    required
                            />
                        </div>

                        <div className="form-group col-md-6">
                                <input  type="email" 
                                        name="email"
                                        className="form-control" 
                                        id="defaultFormRegisterEmailEx2"
                                        placeholder="Correo" 
                                        onChange={this.changeHandler}
                                        required
                                />
                        </div>
                        
                        <div className="form-group col-md-6">
                            <input  type="password" 
                                    name="pass"
                                    className="form-control" 
                                    id="inputPassword4" 
                                    placeholder="Contraseña" 
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                    onChange={this.changeHandler}
                                    required
                            />
                        </div>

                        <div className="form-group col-md-12">
                            <input  type="tel" 
                                    name="phone"
                                    className="form-control" 
                                    placeholder="Teléfono" 
                                    pattern="^\d{3}\d{3}\d{4}$" 
                                    onChange={this.changeHandler}
                                    required
                            />
                        </div>

                        <div className="form-group col-md-12" >
                            <select className="form-control"
                                    name="university"
                                    onChange={this.changeHandler}
                                    >  
                                    <option default>Universidad</option>                                        
                                {opU}
                            </select>
                        </div>

                        <div className="form-group col-md-12">
                            <select className="form-control"
                                name="career"
                                onChange={this.changeHandler}
                                required>  
                                <option  defaultValue>Carrera</option>                                        
                                {opCar}
                            </select>
                        </div>

                        <div className="form-group col-md-12">
                            <select className="form-control"
                                    name="exp"
                                    onChange={this.changeHandler}>  
                                    <option default>Quiero vivir mi experiencia porque...</option>                          
                                {opXps}
                            </select>
                        </div>

                        <div className="form-group col-md-12">
                            <select className="form-control"
                                    name="referal"
                                    onChange={this.changeHandler}>  
                                    <option default>Llegué acá por...</option>                          
                                {opRfs}
                            </select>
                        </div>
                        
                        <div className="form-group col-md-12">{engLvl}</div>
                        <div className="form-group col-md-12">{code}</div>
                    </MDBRow>

                    <div className="form-group form-check">
                        <input type="checkbox" 
                                className="form-check-input"
                                id="exampleCheck1"
                                required
                                 />

                        <label className="form-check-label" htmlFor="exampleCheck1" required>
                            Estoy de acuerdo con los 
                        </label>
                        <a href="https://aieseccolombia.org/wp-content/uploads/2017/02/AVISO-DE-PRIVACIDAD-1.pdf"> términos y condiciones de privacidad</a>
                    </div>
                    <MDBBtn className="col-md-12" color="primary" disabled={this.state.check} type="submit">
                        Crear mi cuenta                    
                    </MDBBtn>
                </form>                     
            </div>
        )
    };
}

export default Form;                