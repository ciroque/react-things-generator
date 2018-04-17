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
  createDirectory(opts);
  writeReducersJs(opts);
  writePrimaryReactComponent(opts);
}

const createDirectory = (opts) => {
  const fs = require('fs');
  if(!fs.existsSync(opts.lowerCaseName)) {
    fs.mkdirSync(opts.lowerCaseName);
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

const writeReducersJs = (opts) => {
  console.log(`writing reducers.js`);
  const fileData = `
    import {combineReducers} from 'redux';

    export const ACTIONS = {
      ADD: 'ACTIONS::${opts.upperCaseName}::ADD',
      CLEAR: 'ACTIONS::${opts.upperCaseName}::CLEAR',
      REMOVE: 'ACTIONS::${opts.upperCaseName}::REMOVE',
      REPLACE: 'ACTIONS::${opts.upperCaseName}::REPLACE'
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
          return state.filter(${opts.lowerCaseName} => ${opts.lowerCaseName} !== payload);
        }

        case ACTIONS.REPLACE: {
          return payload;
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

