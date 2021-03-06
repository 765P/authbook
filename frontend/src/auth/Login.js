import React, { Component } from 'react';
import { Router, Route, Link } from "react-router-dom";
import history from '../history';
import Api from '../data/Api';
import './Login.scss';
import '../themeing.scss';
import logo from '../logo.svg';



import TextField, {HelperText, Input} from '@material/react-text-field';
import Button from '@material/react-button';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
} from '@material/react-dialog';
import {Chip} from '@material/react-chips';
import LinearProgress from '@material/react-linear-progress';
import Card, {
  CardPrimaryContent,
  CardMedia,
  CardActions,
  CardActionButtons,
  CardActionIcons
} from "@material/react-card";
import SignupDialog from '../dialogs/SignupDialog';
import PasswordRecoverDialog from '../dialogs/PasswordRecoverDialog';
import {AuthbookContext} from '../data/AuthbookContext';


export default class Login extends Component {
    static contextType = AuthbookContext;
    constructor(props) {
        super(props);
        this.state = {
            username: "", password: "", url: "https://authbook.herokuapp.com",
            isOpen: false, message: "", loading: false,
            userinfo: this.context
        };
        Api.setUrl(this.state.url);
        this.signup = React.createRef();
        this.pwRecover = React.createRef();
    }
    
    async login(){
        this.setState({loading: true});
        Api.setUrl(this.state.url);
        let res = await Api.login(this.state.username, this.state.password);
        if(res.ok){
            let userdata = await res.json();
            localStorage.setItem("serverUrl", Api.url);
            localStorage.setItem("session", res.headers.get("SESSION"));
            this.setState({loading: false});
            this.context.setUserinfo({ displayName: userdata.displayName,
                             username: userdata.username,
                             email: userdata.email, 
                             encryptionKeySet: userdata.isSeedKeySet,
                             isEmailVerified: userdata.isEmailVerified });
            history.push("/");
        }else{
            let result = await res.json();
            this.setState({message: result.message, loading: false});
        }
    }
    
  render() {
      const loading = this.state.loading ? (<LinearProgress indeterminate={true}/>) : (<div></div>);
      return (
    <div class="Login">
              <Card>
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Authbook</h1><br/>
              
                  <Chip id="urlChip" label={this.state.url} onClick={()=>{this.setState({isOpen: true})}}/><br/>
        <TextField 
            class="loginForm"
            label='Username'>
            <Input disabled={this.state.loading}
                value={this.state.username}
                onChange={(e) => this.setState({username: e.target.value})}/>
        </TextField><br/>
        <TextField 
            class="loginForm"
            label='Password'>
            <Input disabled={this.state.loading}
                type="password"
                value={this.state.password}
                onChange={(e) => this.setState({password: e.target.value})}/>
        </TextField><br/>
              <p>{this.state.message}</p>
              {loading}
        <Button raised="true" onClick={this.login.bind(this)}>Log In</Button><br/>
        <Button onClick={()=>this.signup.current.openForm(this.state.url)}>Sign Up</Button>
        <Button onClick={()=>this.pwRecover.current.openForm(this.state.url)}>Forgot password</Button>
              </Card>
                <Dialog open={this.state.isOpen}>
            <DialogTitle>Configure Server</DialogTitle>
            <DialogContent>
            <p>Type the url of Authbook server instance. It must be HTTPS.</p>
              <TextField textarea
                  label='Server URL'>
                <Input
                    value={this.state.url}
                    onChange={(e) => this.setState({url: e.target.value})}/>
            </TextField>
            </DialogContent>
            <DialogFooter>
              <DialogButton isDefault onClick={()=>{
                        Api.setUrl(this.state.url);
                        this.setState({isOpen: false})
                    }}>Configure</DialogButton>
            </DialogFooter>
      </Dialog>
        <SignupDialog ref={this.signup}/>
        <PasswordRecoverDialog ref={this.pwRecover}/>
    </div>
          
      );
  }
    
}

