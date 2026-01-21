var express = require("express");
var exe = require("../conn");

var router = express.Router();

router.get("/", async function (req, res) {
    var sql = "SELECT * FROM hero";
    var hero = await exe(sql);

    var sql2 = "SELECT * FROM why_donate";
    var why = await exe(sql2);

    var sql3 = "SELECT * FROM donation_camp";
    var camp = await exe(sql3);

    var sql4 = "SELECT * FROM about_us";
    var about = await exe(sql4);

    var sql5 = "SELECT * FROM contact_info";
    var contact = await exe(sql5);

    var packet = { hero, why, camp, about, contact };
    res.render("user/home.ejs", packet);
});

router.get("/about", async function (req, res) {
    var sql = "SELECT * FROM about_us";
    var about = await exe(sql);

    var packet = { about };
    res.render("user/about.ejs", packet);
});

router.get("/blood_list", function (req, res) {
    res.render("user/blood_list.ejs");
});

router.get("/blood_list", function (req, res) {
    res.render("user/blood_list.ejs");
});

router.get("/donation_camp", async function (req, res) {
    var sql = "SELECT * FROM donation_camp";
    var camp = await exe(sql);
    var packet = { camp };
    res.render("user/donation_camp.ejs", packet);
});


router.get("/blood_request", function (req, res) {
    res.render("user/blood_request.ejs");
});

router.get("/contact_us", async function (req, res) {
    var sql = "SELECT * FROM contact_info";
    var contact = await exe(sql);

    var packet = { contact };
    res.render("user/contact_us.ejs", packet);
});

router.get("/register", function (req, res) {
    res.render("user/register.ejs");
});

router.post("/save_register", async function (req, res) {
    var d = req.body;
    var sql = "INSERT INTO donors (donar_id,donar_name, donar_age, donar_gender, donar_blood_group, donar_mobile_number, donar_email_id, donar_city, date) VALUES (?,?,?,?,?,?,?,?,?)";
    var result = await exe(sql, [d.donar_id, d.donar_name, d.donar_age, d.donar_gender, d.donar_blood_group, d.donar_mobile_number, d.donar_email_id, d.donar_city, d.date])
    res.redirect("/");
});

router.post("/request_donar", async function (req, res) {
    var d = req.body;
    var sql = "INSERT INTO blood_request (patient_id, patient_name, required_blood, quantity_required, hospital_name, city_location,  phone_number, urgency_level, additional_information) VALUES (?,?,?,?,?,?,?,?,?)";
    var result = await exe(sql, [d.patient_id, d.patient_name, d.required_blood, d.quantity_required, d.hospital_name, d.city_location, d.phone_number, d.urgency_level, d.additional_information]);
    res.redirect("/")
    // res.send(req.body);
});

router.post("/contact_message", async function (req, res) {
    var d = req.body;
    var sql = "INSERT INTO contact_message (contact_id,contact_name,contact_email,contact_subject,message) VALUES (?,?,?,?,?)";
    var result = await exe(sql, [d.contact_id, d.contact_name, d.contact_email, d.contact_subject, d.message]);
    res.redirect("/")
    // res.send(d);
})

router.post("/register_camp", async function (req, res) {
    var d = req.body;
    var sql = "INSERT INTO register_camp (camp_register_id,full_name,age,blood_group,phone_number,city,camp_name) VALUES (?,?,?,?,?,?,?)";
    var result = await exe(sql, [d.register_id, d.full_name, d.age, d.bood_group, d.phone_number, d.city, d.camp_name]);
    res.redirect("/")
    // res.send(d);
})


module.exports = router;