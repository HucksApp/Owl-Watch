import Performance from '../models/performanceModel';

export const savePerformanceData = async (req, res) => {
    const { tabId, memoryUsage, cpuUsage, networkUsage } = req.body;
    try {
        const performanceData = new Performance({
            user: req.user.id,
            tabId,
            memoryUsage,
            cpuUsage,
            networkUsage
        });

        await performanceData.save();
        res.status(201).json({ message: 'Performance data saved' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save performance data', error });
    }
};

export const getPerformanceData = async (req, res) => {
    try {
        const data = await Performance.find({ user: req.user.id }).sort({ timestamp: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch performance data', error });
    }
};