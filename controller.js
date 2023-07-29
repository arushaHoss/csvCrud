const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser')

let id = 0;


exports.create = async (req, res) => {
  id++;
  let studentArr = [];
  const { name, class: className, section, rollNo, marks } = req.body;
  const newStudent = { id, name, class: className, section, rollNo, marks };

  // Add the new student to the students array
  studentArr.push(newStudent);

  // Save the updated array to the CSV file
  const filePath = 'students.csv'; // Change this to the desired file path
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'Id' },
      { id: 'name', title: 'Name' },
      { id: 'class', title: 'Class' },
      { id: 'section', title: 'Section' },
      { id: 'rollNo', title: 'RollNo' },
      { id: 'marks', title: 'Marks' },
    ],
    append: fs.existsSync(filePath), // Append only if the file exists (contains data)
  });

  try {
    await csvWriter.writeRecords(studentArr);
    console.log('New student record added to CSV file:', newStudent);
  } catch (error) {
    console.error('Error writing student record to CSV file:', error);
  }

  res.redirect('/');
};

exports.form = async (req, res)=>{
    return res.render('form');
};

exports.findOne = async(req, res) => {
    var results = []
    await fs.createReadStream('./students.csv')
    .pipe(csv({}))
    .on('data', (data)=> results.push(data))
    .on('end', async() => {
        
        const data = await results.find(result => result.Id === req.params.id)

        res.render('findOne', {data} );
    })
}

exports.updateForm = async(req,res) => {

    var results = []
    await fs.createReadStream('./students.csv')
    .pipe(csv({}))
    .on('data', (data)=> results.push(data))
    .on('end', async() => {
        
        const data = await results.find(result => result.Id === req.params.id)

        res.render('update', {data} );
    })
}


exports.update = async (req, res) => {
  const results = [];
  const updatedData = {
    Name: req.body.name,
    Class: req.body.class,
    Section: req.body.section,
    RollNo: req.body.rollNo,
    Marks: req.body.marks,
  };

  const fileStream = fs.createReadStream('./students.csv');
  fileStream
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const indexToUpdate = results.findIndex((result) => result.Id === req.params.id);

      if (indexToUpdate === -1) {
        return res.status(404).send('Student not found.');
      }

      updatedData.Id = req.params.id;
      results[indexToUpdate] = updatedData;

      const fileWriteStream = fs.createWriteStream('./students.csv');
      fileWriteStream.write('Id,Name,Class,Section,RollNo,Marks\n');
      results.forEach((result) => {
        fileWriteStream.write(
          `${result.Id},${result.Name},${result.Class},${result.Section},${result.RollNo},${result.Marks}\n`
        );
      });
      fileWriteStream.end();

      res.redirect('/'); 
    });
};



exports.delete = async (req, res) => {
  const filePath = './students.csv';

  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const rows = fileData.trim().split('\n');

    if (rows.length === 0) {
      return res.status(404).send('Student not found.');
    }

    const header = rows.shift();
    const results = rows.map((row) => {
      const rowData = row.split(',');
      return {
        Id: rowData[0],
        Name: rowData[1],
        Class: rowData[2],
        Section: rowData[3],
        RollNo: rowData[4],
        Marks: rowData[5],
      };
    });

    const indexToDelete = results.findIndex((result) => result.Id === req.params.id);

    if (indexToDelete === -1) {
      return res.status(404).send('Student not found.');
    }

    results.splice(indexToDelete, 1);

    if (results.length === 0) {
      fs.writeFileSync(filePath, header + '\n');
    } else {
      const updatedData = [header].concat(results.map((result) => Object.values(result).join(',')));
      fs.writeFileSync(filePath, updatedData.join('\n'));
    }

    console.log('Student record deleted:', req.params.id);

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting student record:', error);
    res.status(500).send('Internal Server Error');
  }
};


