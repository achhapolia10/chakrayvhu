const express = require('express');
const request = require("request");
const web3 = require('../web3');
const expressFileUpload = require('express-fileupload')();
const router = express.Router();
const filetype =require('file-type')
const {SwarmClient} = require('@erebos/swarm-node');
const vendor = require('../vendor');


const client = new SwarmClient({
    http: 'https://swarm-gateways.net'
});

router.post('/sendEvent', async (req, res) => {
    const eventStatus = Boolean(req.body.eventStatus);
    const eventData = req.body.eventData;
    const eventDeviceAddress = req.body.deviceId;
    const accounts = await web3.eth.getAccounts();
    const eventObject = {
        eventStatus: eventStatus,
        eventData: eventData
    };

    client.bzz.uploadFile(JSON.stringify(eventObject), {contentType: 'text/plain'})
        .then(async (hash) => {
            //console.log(accounts);
            let blockdata = await vendor.methods.set_device_data(eventDeviceAddress, hash).send({from: accounts[0]});
            res.status(200).send({result: 'OK', data: hash})
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({result: 'INTERNAL SERVER ERROR'})
        });
});


router.get('/isDevicePresent', async (req, res) => {
    const deviceId = req.query.deviceId;
    try {
        const returnedData = await vendor.methods.is_device_present(deviceId).call();
        res.status(200).send({
            response: 'OK',
            data: returnedData
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            response: 'INTERNAL SERVER ERROR'
        });
    }

});

router.get('/getSavedEvent', (req, res) => {
    const accessHash = req.query.accessHash;

    client.bzz.download(accessHash, {contentType: 'text/plain'})
        .then((promise) => {
            console.log(promise.url);
            request({url: promise.url, json: true}, (err, response, body) => {
                body.result = 'OK';
                res.status(200).send(body);
            });

        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({response: 'INTERNAL SERVER ERROR'});
        })
});


router.get('/getDeviceCount', async (req, res) => {
    try {
        console.log(vendor);
        const returnedData = await vendor.methods.get_device_count().call();
        res.status(200).send({
            result: 'OK',
            data: returnedData
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            result: 'INTERNAL SERVER ERROR',
        });
    }
});


router.get('/getDeviceAtIndex', async (req, res) => {
    const index = req.query.index;
    try {
        const returnedData = await vendor.methods.get_device_at_index(index).call();
        res.status(200).send({
            result: 'OK',
            data: returnedData
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            result: 'INTERNAL SERVER ERROR',
        });
    }
});



router.get('/getDeviceTimeStamp', async (req, res) => {
    const deviceId = req.query.id;
    try {
        const returnedData = await vendor.methods.get_device_timestamps(deviceId).call();
        res.status(200).send({
            result: 'OK',
            data: returnedData
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            result: 'INTERNAL SERVER ERROR',
        });
    }
});


router.get('/getDeviceData', async (req, res) => {
    const deviceId = req.query.deviceId;
    const timeStamp = req.query.time;
    try {
        const returnedData = await vendor.methods.get_device_data(deviceId, timeStamp).call();
        res.status(200).send({
            result: 'OK',
            data: returnedData
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            result: 'INTERNAL SERVER ERROR',
        });
    }
});


router.post('/uploadFile', expressFileUpload ,async (req,res) =>{
    try {
        if (!req.files.event) {
            console.log(req.files);
            res.status(404).send({result: '404 No files found'});
        } else {
            const file = req.files.event;
            console.log(file);
            const eventDeviceAddress = req.body.deviceId;
            const accounts = await web3.eth.getAccounts();


            client.bzz.uploadFile(file.data, {contentType: file.mimetype})
                .then(async (hash) => {
                    //console.log(accounts);
                    let blockdata = await vendor.methods.set_device_data(eventDeviceAddress, hash).send({from: accounts[0]});
                    res.status(200).send({result: 'OK', data: hash})
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send({result: 'INTERNAL SERVER ERROR'})
                });
        }
    } catch (e) {
        res.status(500).send({result: 'INTERNAL SERVER ERROR'});
    }
});
router.get('/getSavedFile', (req, res) => {
    const accessHash = req.query.accessHash;
    //const mimeType = req.query.fileType;
    client.bzz.download(accessHash )
        .then((promise) => {
            console.log(promise.url);

            request({url: promise.url, json: true}, (err, response, body) => {
                body.result = 'OK';
                const mimetype = filetype(Buffer.from(body,'utf-8'));
                console.log(mimetype)
                    res.status(200).send({data:body,result : 'OK',mimetype:mimetype.mime});
            });

        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({response: 'INTERNAL SERVER ERROR'});
        })
});



module.exports = router;
