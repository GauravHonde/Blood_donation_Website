var express = require("express");
var exe = require("../conn");
var router = express.Router();

// Authentication Middleware
function isAdminLoggedIn(req, res, next) {
    console.log("Checking session:", req.session); // Debug log
    if (req.session && req.session.isAdminLoggedIn === true) {
        return next();
    } else {
        return res.redirect("/admin/login");
    }
}

// Apply authentication middleware to all admin routes except login
router.get("/login", function (req, res) {
    res.render("admin/login.ejs");
});

router.post("/admin_login", async function (req, res) {
    var d = req.body;
    // Simple login with hardcoded credentials (you can use database too)
    if (d.admin_username === "admin" && d.admin_password === "admin@@123") {
        req.session.isAdminLoggedIn = true;
        req.session.adminName = d.admin_username;
        res.redirect("/admin");
    } else {
        res.render("admin/login.ejs", { message: "Invalid username or password" });
    }
});

router.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/admin/login");
});

// Protected routes start here
router.get("/", isAdminLoggedIn, async function (req, res) {
    const donors = await exe("SELECT COUNT(*) AS count FROM donors");
    const requests = await exe("SELECT COUNT(*) AS count FROM blood_request");
    const camps = await exe("SELECT COUNT(*) AS count FROM donation_camp");
    const messages = await exe("SELECT * FROM contact_message ORDER BY created_at DESC LIMIT 5");
    const hero = await exe("SELECT COUNT(*) AS count FROM hero");
    const whyDonate = await exe("SELECT COUNT(*) AS count FROM why_donate");
    const aboutUs = await exe("SELECT COUNT(*) AS count FROM about_us");

    res.render("admin/index.ejs", {
        donorsCount: donors[0].count,
        requestsCount: requests[0].count,
        campsCount: camps[0].count,
        messagesCount: messages.length,
        heroCount: hero[0].count,
        whyDonateCount: whyDonate[0].count,
        aboutUsCount: aboutUs[0].count,
        donationCampCount: camps[0].count,
        message: messages,
        camp: await exe("SELECT title, date FROM donation_camp") // for calendar
    });
});

router.get("/doner", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM donors";
    var donar = await exe(sql);
    res.render("admin/doner.ejs", { donar });
});

router.get("/delete_doner/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM donors WHERE donar_id=?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/doner");
});

router.get("/edit_doner/:donar_id", isAdminLoggedIn, async function (req, res) {
    var donar_id = req.params.donar_id;
    var sql = `SELECT * FROM donors WHERE donar_id = ?`;
    var info = await exe(sql, [donar_id]);
    var packet = { info };
    res.render("admin/edit_doner.ejs", packet);
});

router.post("/update_donor/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id;
    // res.send(d);
    var sql = `UPDATE donors SET donar_name = ?, donar_age = ?, donar_gender = ?, donar_blood_group = ?,donar_mobile_number= ?,donar_email_id=?,donar_city=?,date=? WHERE donar_id = ?`;
    var result = await exe(sql, [d.donar_name, d.donar_age, d.donar_gender, d.donar_blood_group, d.donar_mobile_number, d.donar_email_id, d.donar_city, d.date, id]);
    res.redirect("/admin/doner");

})

router.get("/donar_request", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM blood_request";
    var request = await exe(sql);
    res.render("admin/donar_request.ejs", { request });
});

router.post("/request_delete/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM blood_request WHERE patient_id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/donar_request");
});

router.get("/edit_donar_request/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM blood_request WHERE patient_id=?";
    var result = await exe(sql, [id]);
    var packet = { result };
    res.render("admin/edit_donar_request.ejs", packet)
})

router.post("/update_donar_request/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id;
    var sql = `UPDATE blood_request SET patient_name = ?, required_blood = ?, quantity_required = ?, hospital_name = ?,city_location= ?,phone_number=?,urgency_level=?,additional_information=? WHERE patient_id  = ?`;
    var result = await exe(sql, [d.patient_name, d.required_blood, d.quantity_required, d.hospital_name, d.city_location, d.phone_number, d.urgency_level, d.additional_information, id]);
    res.redirect("/admin/donar_request");
    // res.send(d);
})

router.get("/contact_message", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM contact_message";
    var message = await exe(sql);
    res.render("admin/contact_message.ejs", { message });
});

router.get("/delete_message/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM contact_message WHERE contact_id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/contact_message");
})


router.get("/register_camp", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM register_camp";
    var camp = await exe(sql);
    res.render("admin/register_camp.ejs", { camp });
});

router.get("/delete_camp/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM register_camp WHERE camp_register_id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/register_camp");
});

router.get("/edit_camp/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM register_camp WHERE camp_register_id=?";
    var info = await exe(sql, [id]);
    var packet = { info };
    res.render("admin/edit_camp.ejs", packet);
});


router.post("/update_camp/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id;
    var sql = "UPDATE register_camp SET full_name = ?, age=?, blood_group = ?, phone_number = ?, city = ?, camp_name=?, created_at=? WHERE camp_register_id=?";
    var result = await exe(sql, [d.full_name, d.age, d.blood_group, d.phone_number, d.city, d.camp_name, d.created_at, id]);
    res.redirect("/admin/register_camp");
});

router.get("/hero", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM hero";
    var info = await exe(sql);
    var packet = { info };
    res.render("admin/hero.ejs", packet);
});

router.post("/save_hero_data", isAdminLoggedIn, async function (req, res) {
    try {
        var d = req.body;
        // default to existing value or empty string when no file is uploaded
        var filename = d.hero_image || '';
        if (req.files && req.files.hero_image && req.files.hero_image.name) {
            filename = Date.now() + "_" + req.files.hero_image.name;
            // use the existing `public/upload` directory (singular) which is in the repo
            await req.files.hero_image.mv("public/upload/" + filename);
        }
        var sql = `INSERT INTO hero (hero_image, add_quote, para_quote, button_name) VALUES (?,?,?,?)`;;
        var result = await exe(sql, [filename, d.add_quote, d.para_quote, d.button_name]);;
        res.redirect("/admin/hero");
    } catch (err) {
        console.error('Error saving hero data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/delete_hero/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM hero WHERE hero_id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/hero");
});

router.get("/edit_hero/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM hero WHERE hero_id=?";
    var info = await exe(sql, [id]);
    var packet = { info };
    res.render("admin/edit_hero.ejs", packet);
});

router.post("/update_hero", isAdminLoggedIn, async (req, res) => {
    try {
        let d = req.body;
        let filename = d.old_image || "";

        if (req.files && req.files.hero_image) {
            filename = Date.now() + "_" + req.files.hero_image.name;
            await req.files.hero_image.mv("public/upload/" + filename);
        }

        let sql = `
            UPDATE hero
            SET hero_image = ?, add_quote = ?, para_quote = ?, button_name = ?
            WHERE hero_id = ?
        `;

        await exe(sql, [
            filename,
            d.add_quote,
            d.para_quote,
            d.button_name,
            d.hero_id
        ]);

        res.redirect("/admin/hero");
    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed");
    }
});

router.get("/why_donate", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM why_donate";
    var info = await exe(sql);
    var packet = { info };
    res.render("admin/why_donate.ejs", packet);
});

router.post("/add_why_donate", isAdminLoggedIn, async function (req, res) {
    var filename = ""; // default if no file uploaded
    if (req.files && req.files.image) {
        filename = Date.now() + "_" + req.files.image.name;
        await req.files.image.mv("public/upload/why_donate/" + filename);
    }
    var d = req.body;
    // res.send(d);
    var sql = "INSERT into why_donate (title, description, icon, color, image) VALUES (?,?,?,?,?)";
    var result = await exe(sql, [d.title, d.description, d.icon, d.color, filename]);
    res.redirect("/admin/why_donate");
});

router.get("/delete_why_donate/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM why_donate WHERE id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/why_donate");
});

router.get("/edit_why_donate/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM why_donate WHERE id=?";
    var info = await exe(sql, [id]);
    var packet = { info };
    res.render("admin/edit_why_donate.ejs", packet);
});

router.post("/update_why_donate/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id || d.id;
    var filename = d.old_image || "";
    if (req.files && req.files.image) {
        filename = Date.now() + "_" + req.files.image.name;
        await req.files.image.mv("public/upload/why_donate/" + filename);
    }
    var sql = "UPDATE why_donate SET title = ?, description = ?, icon = ?, color = ?, image = ? WHERE id = ?";
    var result = await exe(sql, [d.title, d.description, d.icon, d.color, filename, id]);
    res.redirect("/admin/why_donate");
});


router.get("/donation_camp", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM donation_camp";
    var camp = await exe(sql);
    res.render("admin/donation_camp.ejs", { camp });
});

router.post("/add_donation_camp", isAdminLoggedIn, async function (req, res) {
    var filename = ""; // default if no file uploaded
    if (req.files && req.files.image) {
        filename = Date.now() + "_" + req.files.image.name;
        await req.files.image.mv("public/upload/donation_camp/" + filename);
    }
    var d = req.body;
    // res.send(d);
    var sql = "INSERT into donation_camp (image,title,date,start_time,end_time,location,description,status) VALUES (?,?,?,?,?,?,?,?)";
    var result = await exe(sql, [filename, d.title, d.date, d.start_time, d.end_time, d.location, d.description, d.status]);
    res.redirect("/admin/donation_camp");
});

router.get("/edit_donation_camp/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM donation_camp WHERE id=?";
    var info = await exe(sql, [id]);
    var packet = { info };
    res.render("admin/edit_donation_camp.ejs", packet);
});

router.post("/update_donation_camp/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id;
    var filename = d.old_image || "";
    if (req.files && req.files.image) {
        filename = Date.now() + "_" + req.files.image.name;
        await req.files.image.mv("public/upload/donation_camp/" + filename);
    }
    var sql = "UPDATE donation_camp SET title=?, date=?, start_time=?, end_time=?, location=?, description=?, image=?, status=? WHERE id=?";
    var result = await exe(sql, [d.title, d.date, d.start_time, d.end_time, d.location, d.description, filename, d.status, id]);
    res.redirect("/admin/donation_camp");
});

router.get("/delete_donation_camp/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM donation_camp WHERE id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/donation_camp");
});

router.get("/about_us", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM about_us";
    var info = await exe(sql);
    var packet = { info };
    res.render("admin/about_us.ejs", packet);
});

router.post("/about_list", isAdminLoggedIn, async function (req, res) {
    var filename = ""; // default if no file uploaded
    if (req.files && req.files.image) {
        filename = Date.now() + "_" + req.files.image.name;
        await req.files.image.mv("public/upload/about_us/" + filename);
    }

    var d = req.body;
    // res.send(d);
    var sql = `
INSERT INTO about_us
(image, title, description, focus_point_title, focus_point_1, focus_point_2, focus_point_3)
VALUES (?,?,?,?,?,?,?)
`;

    var result = await exe(sql, [filename, d.title, d.description, d.focus_point_title, d.focus_point_1, d.focus_point_2, d.focus_point_3]);
    res.redirect("/admin/about_us");
});



router.post("/about_update/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id;
    var filename = d.old_image || "";
    if (req.files && req.files.image) {
        filename = Date.now() + "_" + req.files.image.name;
        await req.files.image.mv("public/upload/about_us/" + filename);
    }
    var sql = `
UPDATE about_us
SET image = ?, title = ?, description = ?, focus_point_title = ?, focus_point_1 = ?, focus_point_2 = ?, focus_point_3 = ?
WHERE about_id = ?
`;
    var result = await exe(sql, [filename, d.title, d.description, d.focus_point_title, d.focus_point_1, d.focus_point_2, d.focus_point_3, id]);
    res.redirect("/admin/about_us");

});

router.get("/about_edit/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM about_us WHERE about_id=?";
    var update = await exe(sql, [id]);
    var packet = { update };
    res.render("admin/about_edit.ejs", packet);
});

router.get("/delete_about/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM about_us WHERE about_id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/about_us");
});


router.get("/contact", isAdminLoggedIn, async function (req, res) {
    var sql = "SELECT * FROM contact_info";
    var info = await exe(sql);
    var packet = { info };
    res.render("admin/contact.ejs", packet);
});

router.post("/contact_save", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    // res.send(d);
    var sql = " INSERT INTO contact_info (address,helpline,admin_number,fax_number,email,emergency_email,embed_link) VALUES (?,?,?,?,?,?,?)";
    var result = await exe(sql, [d.address, d.helpline, d.admin_number, d.fax_number, d.email, d.emergency_email, d.embed_link]);
    res.redirect("/admin/contact");
});

router.get("/contact_update/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM contact_info WHERE contact_id=?";
    var update = await exe(sql, [id]);
    var packet = { update };
    res.render("admin/edit_contact.ejs", packet);
});

router.post("/contact_update_save/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var id = req.params.id;
    // res.send(d);
    var sql = "UPDATE contact_info SET address=?, helpline=?, admin_number=?, fax_number=?, email=?, emergency_email=?, embed_link=? WHERE contact_id=?";
    var result = await exe(sql, [d.address, d.helpline, d.admin_number, d.fax_number, d.email, d.emergency_email, d.embed_link, id]);
    res.redirect("/admin/contact");
});

router.get("/contact_delete/:id", isAdminLoggedIn, async function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM contact_info WHERE contact_id = ?";
    var result = await exe(sql, [id]);
    res.redirect("/admin/contact");
});




module.exports = router;