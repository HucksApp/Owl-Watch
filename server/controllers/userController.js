

export const getUser = async (req, res) => {
    if (req.user) {
        res.json(req.user); // Return the user object
      } else {
        res.status(401).json({ message: 'No User' });
      }
};