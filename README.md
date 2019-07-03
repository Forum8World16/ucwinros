# ucwinros


# [Delimiting TCP Strategies](https://cs.nyu.edu/artg/internet/Spring2006/readings/How%20to%20read%20TCP%20data.pdf)
- Boundary Sequence
- Byte Count
- End-of-file

# Message Header
|No |Content        |Unit       |Type   |Sign       |Bytes  |Notes  |
|--:|--:	        |--:	    |--:	|--:	    |---	|:-:	|
|1  |Message Length |           |Long   |unsigned   |4   	| includes everything but the header and footer 	|

# Message Footer
|No |Content        |Unit       |Type   |Sign       |Bytes  |Notes  |
|--:|--:	        |--:	    |--:	|--:	    |---	|:-:	|
|1  |End Delimiter  |   	    |Long   |unsigned   |4   	| 0xF8 0xF8 0xF8 0xF8|

# Vehicle Control Message Schema
|No |Content        |Unit       |Type   |Sign       |Bytes  |Notes  |
|--:|--:	        |--:	    |--:	|--:	    |---	|:-:	|
|1  |Header         |   	    |header |           |4   	|   	|
|2  |Message Type   |   	    |short  |unsigned   |2   	| enum  	|
|3  |Vehicle Id     |   	    |long   |unsigned   |4   	|   	|
|4  |Accelerator    |0.0 to 1.0 |single |signed     |4   	|   	|
|5  |Brake          |0.0 to 1.0 |single |signed     |4   	|   	|
|6  |Steering       |-1.0 to 1.0|single |signed     |4   	|   	|
|7  |Footer         |   	    |footer |           |4   	|   	|

# Camera Message Schema
|No |Content                |Unit       |Type   |Sign     |Bytes|Notes  |
|--:|--:	                |--:	    |--:	|--:	  |---	|:-:	|
|1  |Header         |   	    |header |           |4   	|   	|
|2  |Message Type   |   	    |short  |unsigned   |2   	| enum  	|
|3  |Camera Sensor Id       |   	    |Byte   |unsigned |1   	|id for each camera sensor   	|
|4  |Timestamp              |seconds    |Double |signed   |8   	|time of image from start of communication of plug-in   	|
|5  |Image Number           |0.0 to 1.0 |Long   |unsigned |4   	|image data number [1..*]   	|
|6  |Resolution : Width     |           |Long   |unsigned |4   	|   	|
|7  |Resolution : Height    |           |Long   |unsigned |4   	|   	|
|8  |Starting Line Number   |           |Long   |unsigned |4   	|[1..(Resolution:width)]   	|
|9  |Ending Line Number     |           |Long   |unsigned |4   	|[starting line number..(Resolution:Height)]   	|
|9a | Pixel color: Blue     |0-255      |Byte   |unsigned |1   	|   	|
|9b | Pixel color: Green    |0-255      |Byte   |unsigned |1   	|   	|
|9c | Pixel color: Red      |0-255      |Byte   |unsigned |1   	|if it exceeds 8500 pixels data division occurs   	|
|10 |Footer         |   	    |footer |           |4   	|   	|

# Lidar Message Schema
|No |Content                    |Unit       |Type   |Sign     |Bytes|Notes  |
|--:|--:	                    |--:	    |--:	|--:	  |---	|:-:	|
|1  |Header         |   	    |header |           |4   	|   	|
|2  |Message Type   |   	    |short  |unsigned   |2   	| enum  	|
|3  |Lidar Sensor Id            |   	    |Byte   |unsigned |1   	|id for each lidar sensor   	|
|4  |Timestamp                  |seconds    |Double |signed   |8   	|scanned time from plug-in communication start   	|
|5  |Scan Number: Horizontal    |           |Long   |unsigned |4   	|number for each scan data, [1..*]   	|
|6  |Scan Number: Vertical      |           |Long   |unsigned |4   	|number per scan, [1..*]   	|
|7  |Vertical Angle             |radians    |Single |signed   |4   	|   	|
|8  |Start Horizontal Angle     |radians    |Single |signed   |4   	|horizontal angle of first point   	|
|9  |Horizontal Resolution      |radians    |Single |signed   |4   	|   	|
|10  |Number of Points           |           |Long   |unsigned |4   	|   	|
|10a | distance                  |meters     |Single |signed   |4   	|   	|
|11 |Footer         |   	    |footer |           |4   	|   	|