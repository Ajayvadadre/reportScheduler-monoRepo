import express from 'express';
import { getReportStatus, getConfigData, saveSchedulerConfig, insertReportData, updateScheduleList } from '../controllers/scheduler.controller.js'
let router = express.Router();

router.get('/status', async (req, res) => {

    try {
        let reportData = await getReportStatus();
        if (!reportData) {
            res.status(404).json({
                status: "failed",
                message: 'No data found'
            });
            return
        };

        res.status(200).json({
            status: "successful",
            message: reportData
        });

    } catch (error) {

        console.log('error ::: Unable to fetch reportStatus :::', error);
        res.status(500).json({
            status: "failed",
            message: 'Failed to fetch report status'
        })
    }
});

router.get('/getConfigurations', async (req, res) => {

    try {
        let configData = await getConfigData();

        if (!configData) {
            res.status(404).json({
                status: "successful",
                message: "No data found"
            });
            return
        };

        res.status(200).json({
            status: "successful",
            message: configData
        })
    } catch (error) {
        console.log("error::: Unable to find configuration data:::", error.message);
        res.status(500).json({
            status: "failed",
            message: "failed to fetch configuration data"
        })
    }
})

router.post('/saveSchedulerConfig', async (req, res) => {

    if (!req.body || !req.body.data) {
        res.status(400).json({
            status: "failed",
            message: 'Bad parameters supplied, please provide correct data'
        });
        return
    }

    const { name } = req.body.data;
    try {

        let saveStatus = await saveSchedulerConfig(req.body);

        if (!saveStatus) {
            res.status(500).json({
                status: "failed",
                message: `Failed to schedule report for ::: ${name}`
            });
            return
        }

        res.status(200).json({
            status: "successful",
            message: 'Report scheduled successfully'
        })

    } catch (error) {

        console.log('error ::: Unable to schedule report for id :::', name);
        res.status(500).json({
            status: "failed",
            message: `Failed to schedule report for id:::${name}`
        })
    }
});

router.post('/insertReportData', async (req, res) => {

    const data = req.body;
    console.log(data)
    if (!data) {

        console.log("No data to insert into DB");
        res.status(403).json({
            status: "failed",
            message: "No data to insert please send appropriate data"
        })
    }

    try {

        const insertData = await insertReportData(data);
        console.log("Report data inserted successfully");

        res.status(200).json({
            status: "successful",
            messge: "Report data inserted successfully"
        });

    } catch (error) {

        console.log("error:::Unable to insert reportData:::", error);
        res.status(500).json({
            status: "failed",
            message: `Unable to insert report data`
        })
    }
})

router.post('/updateScheduleList', async (req, res) => {

    const data = req.body;
    console.log(data);
    if (data.length == 0) {
        console.log("No ids to update the data");
        res.status(404).json({
            status: "failed",
            message: "No ids to update data"
        })
    }

    try {
        await updateScheduleList(data);

    } catch (error) {
        console.log("error::: Unable to update data for selected ids",error.message);
        res.status(500).json({
            status: "failed",
            message: "Unable to update data for selected ids"
        })
    }

    res.status(200).json({
        status: "successful",
        message: "Successfully updated data for ids"
    })

})

export default router;
