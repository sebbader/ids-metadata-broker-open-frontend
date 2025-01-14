import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import { ReactiveBase } from "@appbaseio/reactivesearch";
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import MenuIcon from '@material-ui/icons/Menu';
import { Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import SearchConnectors from "./components/SearchConnectors";
import SearchFhgResources from "./components/SearchFhgResources";
import DataPrivacyView from "./DataPrivacyView";
import ImprintView from "./ImprintView";

import "./css/App.scss"
import FhgResourceView from "./components/ConnectorFhg";
import Maintainer from "./components/Maintainer";
import UsageControl from "./components/UsageControl";
import ParticipantList from "./components/ParticipantList";
import Tooltip from '@material-ui/core/Tooltip';
import SearchMDMResources from './components/SearchMDMResources';
import { BrokerResourceView } from './components/BrokerResourceView';
import { SearchBroker, BrokerConnectorView, BrokerFilter } from "./components/ConnectorBroker";
import { SearchParis, ParisConnectorView } from "./components/ConnectorParis";

import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/authActions';
import LoginOrLogout from './components/auth/LoginOrLogout';
import SidebarList from './components/SidebarList';
import Adminx from './components/Adminx';
import { BrokerConnectorViewComponent } from './components/BrokerConnectorViewComponent';

import { elasticsearchURL } from './urlConfig';

const drawerWidth = 300;
const styles = theme => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        backgroundColor: '#F2F2F2',
        height: '65px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: '0 1px #ccc',
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.leavingScreen
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        boxShadow: '0 1px #ccc',
        width: `calc(100% - ${drawerWidth}px)`,
        height: '65px',
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    menuButtonHidden: {
        display: 'none',
    },
    logo: {
        marginTop: '6px',
        display: 'flex',
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
        '& p': {
            marginTop: '25px'
        },
        '& h4': {
            marginTop: '2px'
        }
    },
    drawerPaper: {
        whiteSpace: 'nowrap',
        width: drawerWidth,
        borderWidth: '0px',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: 'white',
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.leavingScreen
        }),
        marginLeft: 0,
    },
    contentShift: {
        marginLeft: drawerWidth,
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
    },
    container: {
        padding: '20px !important'
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },
    titles: {
        marginLeft: '48px',
        flexGrow: 3,
        display: 'flex',
    },
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,
            resource: {}
        };

        // localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("user", "");
    }

    // change eis to paris to have the paris frontend
    tenant = process.env.REACT_APP_TENANT || 'eis';
    tenant = this.tenant.toLowerCase();

    setBrokerURL = () => {
        if (window._env_ === undefined)
            this.brokerURL = 'https://localhost';
        else
            this.brokerURL = window._env_.REACT_APP_BROKER_URL;
        this.brokerMainURL = this.brokerURL;
        this.brokerURL = new URL('/es', this.brokerURL).toString();
    }

    handleDrawerOpen = () => {
        this.setState({
            open: true
        })
    };

    handleDrawerClose = () => {
        this.setState({
            open: false
        })
    };

    updateResource = (obj) => {
        this.setState({
            resource: obj
        }, () => {
            window.localStorage.setItem('resource', JSON.stringify(this.state.resource))
        })
    }

    renderSubTitle = (url) => {
        if (url.indexOf('connector') > -1 || url.indexOf('resources') > -1) {
            return 'Search';
        } else if (url.indexOf('browse') > -1) {
            return 'Dashboard';
        } else {
            return 'Dashboard';
        }
    }

    renderMainTitle = (name) => {
        if (name === 'paris') {
            document.title = "Participant Information Service";
            return 'Participant Information Service (ParIS)';
        } else if (name === 'eis') {
            document.title = "International Data Spaces Broker";
            return 'Fraunhofer IAIS';
        } else if (name === 'fhg') {
            document.title = "Fraunhofer-Digital Data Space Broker";
            return 'Fraunhofer-Datenraum';
        } else if (name === 'mobids') {
            document.title = "Mobility Data Space Broker";
            return 'Mobility Data Space Broker';
        } else return 'International Data Spaces';
    }

    renderComponentTenant = (name) => {
        if (name === 'paris') {
            return (
                <SearchConnectors {...this.props} />
            )
        } else if (name === 'eis') {
            return (
                <SearchConnectors {...this.props} />
            )
        } else if (name === 'fhg') {
            return (
                <SearchFhgResources {...this.props} updateResource={this.updateResource} />
            )
        } else {
            return (
                <SearchConnectors {...this.props} />
            )
        }
    }

    getElasticSearchIndex = (name) => {
        if (name === 'fhg')
            return 'fhgresources';
        else
            return 'registrations';
    }

    componentDidMount() {
        this.setBrokerURL();
        this.setState({
            resource: window.localStorage.getItem("resource")
        })
        store.dispatch(loadUser());
    }

    render() {
        const { classes } = this.props;
        let tenant = this.tenant.toLowerCase();
        let currentResource = this.state.resource;
        let footerPos1 = ""
        let footerPos2 = ""
        let logo = <Link style={{ textDecoration: 'none' }} to="/">
            <h1>IDS</h1>
        </Link>
        if (tenant === 'mobids') {
            logo = <Link style={{ textDecoration: 'none' }} to="/">
                <img src="./logo.png" alt="image" width='135px' />
            </Link>
            footerPos1 = <Box component="footer" className="footer" m={1}>
                <Grid container spacing={3} className="footer-copyright">
                    <Grid container item xs={12} className="footer-header">
                        <h5 style={{ fontSize: '14px', paddingTop: '6px' }}>{this.renderMainTitle(this.tenant)}</h5>
                        <p style={{ fontSize: '10px', textAlign: 'center' }}>International Data Spaces</p>
                    </Grid>
                    <Grid container>
                        <Grid className="footer-mail" container item xs={12} lg={12} md={12} >
                            <a href="https://www.iais.fraunhofer.de/.org/" style={{ fontSize: '10px' }}>© {new Date().getFullYear()}&nbsp;Fraunhofer IAIS</a>

                        </Grid>
                        <Grid className="footer-mail" container item xs={12} lg={12} md={12} >
                            <a href="mailto:contact@ids.fraunhofer.de" style={{ fontSize: '10px' }}>contact@ids.fraunhofer.de</a>
                        </Grid>
                    </Grid>
                    <Grid container >
                        <Grid className="footer-privacy" container item xs={12} lg={12} md={12} style={{ marginTop: '10px' }}>
                            <Link to="/data-protection" style={{ fontSize: '10px' }}>Data Protection Policy</Link>
                        </Grid>
                        <Grid className="footer-privacy" container item xs={12} lg={12} md={12}>
                            <Link to="/imprint" style={{ fontSize: '10px' }}>Imprint</Link>
                        </Grid>
                        <Grid className="footer-mail" container item xs={12} lg={12} md={12}  >
                            <p style={{ fontSize: '10px' }}>  Last Modified: {new Date(document.lastModified).getDate() + "." + parseInt(new Date(document.lastModified).getMonth() + 1) + "." + new Date(document.lastModified).getFullYear()}</p>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        }
        else {
            footerPos2 = <Box component="footer" className="footer" m={2}>
                <Grid container spacing={6} className="footer-copyright">
                    <Grid container item xs={6} className="footer-header">
                        <h5 style={{ fontSize: '14px', paddingTop: '6px' }}>{this.renderMainTitle(this.tenant)}</h5>
                        <p style={{ fontSize: '10px', textAlign: 'left' }}>International Data Spaces</p>
                    </Grid>
                    <Grid className="footer-mail" container item xs={6} lg={6} md={6} >
                        <a href="mailto:contact@ids.fraunhofer.de" style={{ fontSize: '10px' }}>contact@ids.fraunhofer.de</a>
                    </Grid>
                    <Grid className="footer-mail" container item xs={6} lg={6} md={6} >
                        <a href="https://www.iais.fraunhofer.de/.org/" style={{ fontSize: '10px' }}>© {new Date().getFullYear()}&nbsp;Fraunhofer IAIS</a>
                    </Grid>

                    <Grid className="footer-privacy" container item xs={6} lg={6} md={6} style={{ marginTop: '10px' }}>
                        <Link to="/data-protection" style={{ fontSize: '10px' }}>Data Protection Policy</Link>
                    </Grid>
                    <Grid className="footer-mail" container item xs={6} lg={6} md={6}  >
                        <p style={{ fontSize: '10px' }}>  Last Modified: {new Date(document.lastModified).getDate() + "." + parseInt(new Date(document.lastModified).getMonth() + 1) + "." + new Date(document.lastModified).getFullYear()}</p>
                    </Grid>
                    <Grid className="footer-privacy" container item xs={6} lg={6} md={6}>
                        <Link to="/imprint" style={{ fontSize: '10px' }}>Imprint</Link>
                    </Grid>

                </Grid>
            </Box>
        }

        return (
            <Provider store={store}>
                <div className={"theme-" + this.tenant}>
                    <CssBaseline />
                    <AppBar position="absolute" className={clsx(classes.appBar, this.state.open && classes.appBarShift)}>
                        <Toolbar className={classes.toolbar}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="open drawer"
                                onClick={this.state.open ? this.handleDrawerClose : this.handleDrawerOpen}
                                className={classes.menuButton}
                            >
                                <MenuIcon />
                            </IconButton>

                            <div color="inherit" className={classes.logo}>
                                <div className={classes.titles}>
                                    <h3 style={{ color: '#808080' }}>{this.renderMainTitle(this.tenant)}</h3>
                                    <h3 style={{ fontWeight: 'bold', marginLeft: '10px', color: '#808080' }}>{this.renderSubTitle(this.props.location.pathname)}</h3>
                                </div>

                            </div>

                            <LoginOrLogout />
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        variant="persistent"
                        classes={{
                            paper: clsx(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                        }}
                        open={this.state.open}
                    >
                        <div className={classes.toolbarIcon} >

                            {logo}

                        </div>
                        <SidebarList tenant={this.tenant} />
                        {footerPos1}
                    </Drawer>
                    <main className={clsx(classes.content, {
                        [classes.contentShift]: this.state.open
                    })}>
                        <div className={classes.appBarSpacer} />
                        <Container maxWidth="lg" className={classes.container}>
                            <Route path="/browse">
                                <Dashboard />
                            </Route>
                            <Route path="/connector/:resID">
                                {
                                    <BrokerConnectorViewComponent {...this.props} es_url={this.brokerURL} showBackButton={true} />

                                }
                            </Route>
                            <Route exact path="/connector">
                                <ReactiveBase
                                    app={this.getElasticSearchIndex(this.tenant)}
                                    credentials="null"
                                    url={this.brokerURL}
                                    analytics
                                >
                                    {
                                        this.renderComponentTenant(this.tenant)
                                    }
                                </ReactiveBase>
                            </Route>
                            <Route path="/resources/:resID">
                                {
                                    <BrokerResourceView {...this.props} es_url={this.brokerURL} showBackButton={true} />
                                }
                            </Route>
                            <Route exact path="/resources">
                                <ReactiveBase
                                    app="resources"
                                    credentials="null"
                                    url={this.brokerURL}
                                    analytics
                                >
                                    <SearchMDMResources {...this.props} />
                                </ReactiveBase>
                            </Route>
                            <Route exact path="/participants">
                                <ReactiveBase
                                    app={this.getElasticSearchIndex(this.tenant)}
                                    credentials="null"
                                    url={this.brokerURL}
                                    analytics
                                >
                                    {
                                        this.renderComponentTenant(this.tenant)
                                    }
                                </ReactiveBase>
                            </Route>
                            <Route path="/data-protection">
                                <DataPrivacyView />
                            </Route>
                            <Route path="/imprint">
                                <ImprintView />
                            </Route>
                            <Route path="/maintainer">
                                <Maintainer />
                            </Route>
                            <Route path="/usage-control">
                                <UsageControl />
                            </Route>
                            <Route path="/participant-list">
                                <ParticipantList />
                            </Route>
                            <Route path="/admin">
                                <Adminx />
                            </Route>
                        </Container>
                        {footerPos2}
                    </main>
                </div>
            </Provider>
        );
    }
}

export default withStyles(styles)(App);