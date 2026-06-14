// important requires 
const fs = require('fs');
const path = require('path');
const csvFilePath ='tempDataSet.csv';
const express = require('express')
/*
Preset the server, here you can customize the port and the inputs. 
*/
const app = express();
const port = 5501;
let input = 0;
let command = 'color #ff0000; set pk off; select .A:138-144; color #26619C; select :SQ,TQ | name :SQ,TQ';

app.use(express.static('results'));
app.use(express.json())

app.get('/info', (req, res) => {
    res.status(200).json({info: command})
})
app.post('/', (req, res) => {
    const {parcel } = req.body
    if (!parcel){return res.status(400).send({status: 'Failed to connect'})}
    let convertedValue = parseInt(parcel, 10);
    if (!isNaN(convertedValue)) {
        input = convertedValue;
        main(input).then(value => console.log(value));
        res.status(200).json({info: command})
    } else {console.log(`Error: ${parcel} is not an integer`)}
})
app.listen(port, () => console.log('Server has started on port: '+port));

/* ----------------------------------------  -----------------------------------------------------------------------------*/
/* Change and manipulate strings in order to get the output for "command", 
  toiCn3D() formats command into the necessary format, you can freely manipulate the order of out put here.

*/
function toiCn3D(input, repeats, Window, motif, organism, uniprotID, proteinName, begcoord, endcoord, stringmotif) {
    const tempSW = parseInt(repeats, 10);
    const tempEW = parseInt(Window, 10);
  
    function motifCheck(number, filePath) {
      const data = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      const motifDict = jsonData.motifs;
      var readMotif = motifDict[number];
      if (typeof readMotif === 'undefined') {
        console.error('Exiting...');
        process.exit(1); // Exit with error code 1
      }
    
      const regex = /\[([^\]]+)\]/g;
      const matches = [...readMotif.matchAll(regex)];
    
      if (matches.length > 0) {
        const variations = [];
    
        function generateVariations(currentString, index) {
          if (index === matches.length) {
            variations.push(currentString);
            return;
          }
          const words = matches[index][1].split(' ');
          words.forEach(word => {
            const newString = currentString.replace(matches[index][0], word);
            generateVariations(newString, index + 1);
          });
        }
        generateVariations(readMotif, 0);
        return variations;
      } else {
        return [readMotif];
      }
    }
    // formula for distribution of window
    var i = parseInt(begcoord, 10);
    var n = parseInt(endcoord, 10);
    var x = (Window - (n - i)) / 2;
    var { i_new: i, n_new: n } = { i_new: Math.ceil(i - x), n_new: Math.ceil(n + x) };
    motif = motifCheck(parseInt(motif, 10), "motifs.json");
    x = motif.reduce((max, returnedmotifs) => {
      return Math.max(max, returnedmotifs.length);
    }, 0);
    
    const cDall = true;
    // display a single existing hit, [SQ,TQ]
    if(cDall){
      var sWindow= 'select .A:'+begcoord+'-'+endcoord + `; color #26619C; ` + 'select .A:'+i+'-' +n;
      var inputMotif = `color #808080; ` + 'select :'+ motif +  " | name :"+motif + `; color #F0000`;
  
      var commandSent = `${proteinName}, ${inputMotif}; ${sWindow}`;
      //  var commandSent = `${proteinName}, color #808080; select :SQ,TQ | name :SQ,TQ; color F00; select .A:24-34; color #26619C; select .A:27-30`;
    
    
      
      // Example for all motifs:  Q9H6L4, ; select :SQ,TQ | name :SQ,TQ; color F00; select .A:27-30
    // only display the coordinates,
    }else{
      let sWindow= 'select .A:'+begcoord+'-'+endcoord;
      const sWindowcolor= 'color #26619C';
      var commandSent = String(intermid.concat(proteinName + ', '+ defaultcolor+"; "+pk+"; "+sWindow+"; "+sWindowcolor+"; "+inputMotif));
    }
    /* the output should look similar to this: Q9H6L4, color #808080; select :SQ,TQ | name :SQ,TQ; color F0000; select .A:24-34; color #26619C; select .A:27-30
                                               (protein name), [command]. the html splits it based on the comma, everything else should follow the command order.
    */
    //consle.log(commandSent);
    return commandSent;
}

/* 
This function sets up the rest of the file
.csv data is used and converted to a string and a list.
the string contians sWindow and motifs, while the list 
contains first column values (I.E ref_seq IDs).
*/
function processCSV(input, filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                reject(err); // Propagate error
            } else {
                const lines = data.split('\n');
                const AllValues = [];
                const Datadict = {};
                    //returns a dictionary with the required info.
                    const line = lines[input];
                    const parts = line.split('\t');
                    if (parts.length > 0) {
                        const ColumnValues = parts.slice(0, 10).map(value => value.trim());
                        AllValues.push(ColumnValues);
                        Datadict[input] = ColumnValues;
                    }        
                //error handeling and data manipulation.
                let values = Datadict[input];
                values = values.map(value => (value === "." || value === " " ? "null" : value));
                let [repeats, Window, motif, organism, uniprotID, proteinName, begcoord, endcoord, stringmotif] = values;
                let command = toiCn3D(input, repeats, Window, motif, organism, uniprotID, proteinName, begcoord, endcoord, stringmotif);
              
                resolve(command);
            }
        });
    });
}
// this is called from the server, this is the heart of the backend.
async function main(input) {
    try {
       return command = await processCSV(input, csvFilePath);
    } catch (error) {
        console.error("Failed to process CSV:", error);
    }
}