#!/usr/bin/env node

const args = process.argv.slice(2);

parseArgs = () => {
  var args = {};
  process.argv.slice(2).forEach((val, idx) => {
    if(val.indexOf("=") > -1) {
      const [k, v] = val.split("=");
      args = Object.assign({}, args, {[k]: v});
    } else {
      args = Object.assign({}, args, {[idx]: val});
    }
  });
  return args;
};

const processName = (opts) => {
  if(opts.name) {
    const name = opts.name;
    const caps = name.toUpperCase();
    const lower = name.toLowerCase();

    opts = Object.assign({}, opts, {lowerCaseName: lower, upperCaseName: caps});
  }

  return opts;
};

function main() {
  const opts = processName(parseArgs());

  console.log(`
    opts: ${JSON.stringify(opts)}}
  `);
  createDirectories(opts);
  writeReducersJs(opts);
  writePrimaryReactComponent(opts);
  writePrimaryReduxComponent(opts);
  writeActionsJs(opts);
  writePrimaryCss(opts);
  writeDetailsReactComponent(opts);
  writeDetailsReduxComponent(opts);
}

const createDirectories = (opts) => {
  const fs = require('fs');
  if(!fs.existsSync(opts.lowerCaseName)) {
    fs.mkdirSync(opts.lowerCaseName);
  }
  if(!fs.existsSync(`./${opts.lowerCaseName}/details`)) {
    fs.mkdirSync(`./${opts.lowerCaseName}/details`);
  }
};

const writePrimaryReactComponent = (opts) => {
  console.log(`writing primary React component`);
  const fileData = `
    import React from 'react';
    import ReactTable from "react-table";
    import Details from "./details/details";

    export default class ${opts.name} extends React.Component {
      constructor(opts) {
        super(props);
      }

      columns = () => {
        return [
          { Header: () => (<span>Id</span>), accessor: 'id' }
        ];
      };

      componentWillMount = () => {
        this.props.load${opts.name}List();
      };

      render = () => {
        return (
          <div classsName='${opts.lowerCaseName}-root'>
            <div className='ui-group'>
              <ReactTable
                data={this.props.${opts.lowerCaseName}List}
                columns={this.columns()}
                defaultPageSize={10}
                showPagination={true}
                SubComponent={(row) => { return <Details record={row.original} />; }}
            </div>
          </div>
        );
      };
    };
  `;

  writeDataToFile(`./${opts.lowerCaseName}/${opts.lowerCaseName}.js`, fileData);
};

const writeActionsJs = (opts) => {
  console.log(`writing actions.js`);
  const fileData = `
import {clearFetching, setFetching} from "../../store/actions";
import {assertSuccess, parseResponseJson, withResponseClass} from "../../fetchHelpers";
import {ACTIONS} from './reducers';

const baseUri = '/api/${opts.lowerCaseName}';
const headers = {'Content-Type': 'application/json', 'Accept': 'application/json'};

export const clear${opts.name}List = () => ({type: ACTIONS.CLEAR, payload: null});
export const replace${opts.name}List = (${opts.lowerCaseName}List) => ({type: ACTIONS.REPLACE, payload: ${opts.lowerCAseName}List});
export const add${opts.name} = (${opts.lowerCaseName}) => ({type: ACTIONS.ADD, payload: ${opts.lowerCaseName}});
export const remove${opts.name} = (${opts.lowerCaseName}) => ({type: ACTIONS.REMOVE, payload: ${opts.lowerCaseName}});
export const update${opts.name} = (${opts.lowerCaseName}) => ({type: ACTIONS.UPDATE, payload: ${opts.lowerCaseName}});

export const load${opts.name}List = () => (dispatch) => {
  dispatch(setFetching());

  return fetch(baseUri)
    .then(withResponseClass)
    .then(assertSuccess)
    .then(parseResponseJson)
    .then((json) => {
      dispatch(replace${opts.name}List(json.data));
      return dispatch(clearFetching());
    })
    .catch((error) => {
      return dispatch(clearFetching());
    });
};

export const save${opts.name} = (${opts.lowerCaseName}) => (dispatch) => {
  dispatch(setFetching());
  const endpoint = `${baseUri}/${${opts.lowerCaseName}.id}`;
  const body = JSON.stringify(${opts.lowerCaseName});

  return fetch(endpoint, { method: 'put', headers: headers, body: body })
    .then(withResponseClass)
    .then(assertSuccess)
    .then(parseResponseJson)
    .then((json) => {
      dispatch(clearFetching());
    })
    .catch((error) => {
      dispatch(clearFecthing());
    });
};

export const delete%{opts.name} = (${opts.lowerCaseName}) => (dispatch) => {
  dispatch(setFetching());
  const endpoint = `${baseUri}/${opts.lowerCaseName}`;
  return fetch(endpoint, {method: 'delete', headers: headers})
    .then(withResponseClass)
    .then(assertSuccess)
    .then(parseResponseJson)
    .then((json) => {
      dispatch(removePerson(person));
      return dispatch(clearFetching());
    })
    .catch((error) => {
      return dispatch(clearFetching());
    });
};


  `;
  
  writeDataToFile(`./${opts.lowerCaseName}/actions.js`, fileData); 
};

const writePrimaryCss = (opts) => {
  console.log(`writing primary css`);
  const fileData = ``;
  writeDataToFile(`./${opts.lowerCaseName}/${opts.lowerCaseName}.css`, fileData);
};

const writePrimaryReduxComponent = (opts) => {
  console.log(`writing primary Redux component`);
  const fileData = `
    import { connect } from 'react-redux';
    import { withRouter } from 'react-router-dom';
    import {load${opts.name}List} from "./actions";
    import ${opts.name} from "./${opts.lowerCaseName}";

    const mapStateToProps = () => state => {
      return {
        ${opts.lowerCaseName}: state.${opts.lowerCaseName}.${opts.lowerCaseName}List
      };
    };

    const mapDispatchToProps = () => dispatch => {
      return {
        load${opts.name}List: () => dispatch(load${opts.name}List())
      };
    };

    export default withRouter(connect(mapStateToProps, mapDispatchToProps)(${opts.name}));
  `;

  writeDataToFile(`./${opts.lowerCaseName}/${opts.lowerCaseName}.container.js`, fileData);
};

const writeReducersJs = (opts) => {
  console.log(`writing reducers.js`);
  const fileData = `
    import {combineReducers} from 'redux';

    export const ACTIONS = {
      ADD: 'ACTIONS::${opts.upperCaseName}::ADD',
      CLEAR: 'ACTIONS::${opts.upperCaseName}::CLEAR',
      REMOVE: 'ACTIONS::${opts.upperCaseName}::REMOVE',
      REPLACE: 'ACTIONS::${opts.upperCaseName}::REPLACE',
      UPDATE: 'ACTIONS::${opts.upperCaseName}::UPDATE'
    };

    export const NULL_${opts.upperCaseName} = {};

    export const INITIAL_${opts.upperCaseName}_LIST = [];

    export const ${opts.lowerCaseName}List = (state = INITIAL_${opts.upperCaseName}_LIST, action) => {
      const {type, payload} = action;
      switch(type) {
        case ACTIONS.ADD: {
          return [...state, payload];
        }

        case ACTIONS.CLEAR: {
          return INITIAL_${opts.upperCaseName}_LIST;
        }

        case ACTIONS.REMOVE: {
          return state.filter(${opts.lowerCaseName} => ${opts.lowerCaseName}.id !== payload.id);
        }

        case ACTIONS.REPLACE: {
          return payload;
        }

        case ACTIONS.UPDATE: {
          const others = state.filter(${opts.lowerCaseName} => ${opts.lowerCaseName}.id !== payload.id);
          return [...others, payload];
        }

        default: {
          return state;
        }
      }
    };
   
    const ${opts.lowerCaseName} = combineReducers({
      ${opts.lowerCaseName}List
    }); 

    export default ${opts.lowerCaseName};
  `;

  writeDataToFile(`./${opts.lowerCaseName}/reducers.js`, fileData);
};

const writeDetailsReduxComponent = (opts) => {
  console.log(`writing details redux component`);

  const fileData = `
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Details from "./details";
import {delete${opts.name}, save${opts.name}, update${opts.name}} from "../actions";

const mapStateToProps = () => state => {
  return {};
};

const mapDispatchToProps = () => dispatch => {
  return {
    delete${opts.name}: (${opts.lowerCaseName}) => dispatch(delete${opts.name}(${opts.lowerCaseName})),
    save${opts.name}: (${opts.lowerCaseName}) => dispatch(save${opts.name}(${opts.lowerCaseName})),
    update${opts.name}: (${opts.lowerCaseName}) => dispatch(update${opts.name}(${opts.lowerCaseName}))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Details));
  `;

  writeDataToFile(`./${opts.lowerCaseName}/details/details.container.js`, fileData);
};

const writeDetailsReactComponent = (opts) => {
  console.log(`writing details React component`);
  const fileData = `
import React from 'react';
import './details.css';

export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, props.record);
  }

  handleInputChange = (evt) => {
    const target = evt.target;
    const value = target.value;
    const name = target.name;
    const updated = Object.assign({}, this.props.record, {[name]: value});
    return this.setState(updated);
  };

  renderForm = () => {
    return (
      <form>
      </form>
    );
  };

  renderToolbar = () => {
    return (
      <div className="toolbar-root">
        <button
          className="btn btn-success"
		  onClick={() => this.props.save${opts.name}(this.state)}
        >Save</button>

        <button
          className="btn btn-danger"
		  onClick={() => this.props.delete${opts.name}(this.state)}
        >Delete</button>
      </div>
    );
  };

  render() {
    return (
      <div className="details-root ui-group">
        {this.renderForm()}
        {this.renderToolbar()}
      </div>
    );
  }  
};
  `;

  writeDataToFile(`./${opts.lowerCaseName}/details/details.js`, fileData);
};

const writeDataToFile = (fn, data) => {
  const fs = require('fs');

  fs.writeFile(fn, data, (err) => {
    if(err) {
      console.error(JSON.stringify(err));
      throw err;
    }
  });
};

main();

