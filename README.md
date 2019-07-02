# ucwinros

# Vehicle Control Schema
|No |Content    |Unit       |Type   |Sign       |Bytes  |Notes  |
|--:|--:	    |--:	    |--:	|--:	    |---	|:-:	|
|1  |Vehicle Id |   	    |long   |unsigned   |4   	|   	|
|2  |Accelerator|0.0 to 1.0 |single |signed     |4   	|   	|
|3  |Brake      |0.0 to 1.0 |single |signed     |4   	|   	|
|4  |Steering   |-1.0 to 1.0|single |signed     |4   	|   	|


# Camera Schema
|No |Content                |Unit       |Type   |Sign     |Bytes|Notes  |
|--:|--:	                |--:	    |--:	|--:	  |---	|:-:	|
|1  |Camera Sensor Id       |   	    |Byte   |unsigned |1   	|id for each camera sensor   	|
|2  |Timestamp              |seconds    |Double |signed   |8   	|time of image from start of communication of plug-in   	|
|3  |Image Number           |0.0 to 1.0 |Long   |unsigned |4   	|image data number [1..*]   	|
|4  |Resolution : Width     |           |Long   |unsigned |4   	|   	|
|5  |Resolution : Height    |           |Long   |unsigned |4   	|   	|
|6  |Starting Line Number   |           |Long   |unsigned |4   	|[1..(Resolution:width)]   	|
|7  |Ending Line Number     |           |Long   |unsigned |4   	|[starting line number..(Resolution:Height)]   	|
|7a | Pixel color: Blue     |0-255      |Byte   |unsigned |1   	|   	|
|7b | Pixel color: Green    |0-255      |Byte   |unsigned |1   	|   	|
|7c | Pixel color: Red      |0-255      |Byte   |unsigned |1   	|if it exceeds 8500 pixels data division occurs   	|


# Lidar Schema
|No |Content                    |Unit       |Type   |Sign     |Bytes|Notes  |
|--:|--:	                    |--:	    |--:	|--:	  |---	|:-:	|
|1  |Lidar Sensor Id            |   	    |Byte   |unsigned |1   	|id for each lidar sensor   	|
|2  |Timestamp                  |seconds    |Double |signed   |8   	|scanned time from plug-in communication start   	|
|3  |Scan Number: Horizontal    |           |Long   |unsigned |4   	|number for each scan data, [1..*]   	|
|4  |Scan Number: Vertical      |           |Long   |unsigned |4   	|number per scan, [1..*]   	|
|5  |Vertical Angle             |radians    |Single |signed   |4   	|   	|
|6  |Start Horizontal Angle     |radians    |Single |signed   |4   	|horizontal angle of first point   	|
|7  |Horizontal Resolution      |radians    |Single |signed   |4   	|   	|
|8  |Number of Points           |           |Long   |unsigned |4   	|   	|
|8a | distance                  |meters     |Single |signed   |4   	|   	|