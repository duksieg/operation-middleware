const { createLogger, format, transports } = require('winston');

module.exports ={
     logger: logger = createLogger({
        level: 'info',
        format: format.simple(),
        // You can also comment out the line above and uncomment the line below for JSON format
        // format: format.json(),
        transports: [
            new transports.File({
                filename: 'operationProcess.log',
                level: 'info'
            }),
            new transports.Console({
                level: 'info',
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            })]
    })
}



