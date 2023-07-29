var express = require("express");
var router = express.Router();

const controller = require('./controller');


router.get('/form', controller.form);
router.post('/create', controller.create);
router.get('/edit/:id', controller.updateForm);
router.get('/findOne/:id', controller.findOne);
router.post('/update/:id', controller.update);
router.post('/delete/:id', controller.delete);



module.exports = router;