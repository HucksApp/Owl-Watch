import axios from "axios"; // To call Python AI service

export const getTabSuggestions = async (req, res) => {
    const { tabData } = req.body;  // Array of user tab data: { timeSpent, cpuUsage, memoryUsage, tabType }

    try {
        const response = await axios.post('http://localhost:5001/predict', { tabData });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch AI suggestions', error });
    }
};