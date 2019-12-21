#include <U8glib.h>//使用OLED需要包含这个头文件
#include <Microduino_Tem_Hum.h>
#include <Microduino_RTC.h>
#include <ESP8266.h>
#define PIN_KEY D4   //触摸接在d4

#define SSID        "628" //改为你的热点名称, 不要有中文
#define PASSWORD    "12345678"//改为你的WiFi密码Wi-Fi密码
#define DEVICEID    "576099049" //OneNet上的设备ID
String apiKey = "BAJm0GCSLnDd8oUUpV6MO8N3328=";//与你的设备绑定的APIKey
#define HOST_NAME   "api.heclouds.com"
#define HOST_PORT   (80)
#define INTERVAL_SENSOR   1000             //定义传感器采样时间间隔  597000
#define INTERVAL_NET      1000             //定义发送时间

//WEBSITE     
char buf[10];

#define INTERVAL_sensor 2000
unsigned long sensorlastTime = millis();

float tempOLED, humiOLED, lightnessOLED;

#define INTERVAL_OLED 1000

String mCottenData;
String jsonToSend;
/***/
//3,传感器值的设置 
float sensor_tem;                    //传感器温度、湿度、光照   
char  sensor_tem_c[7];    //换成char数组传输
#include <SoftwareSerial.h>
#define EspSerial mySerial
#define UARTSPEED  9600
SoftwareSerial mySerial(2, 3); /* RX:D3, TX:D2 */
ESP8266 wifi(&EspSerial);
//ESP8266 wifi(Serial1);                                      //定义一个ESP8266（wifi）的对象
unsigned long net_time1 = millis();                          //数据上传服务器时间
unsigned long sensor_time = millis();                        //传感器采样时间计时器

//int SensorData;                                   //用于存储传感器数据
String postString;                                //用于存储发送数据的字符串
//String jsonToSend;                                //用于存储发送的json格式参数


long previousMillis = 0;        // 存储LED最后一次的更新
long interval = 15000;           // 闪烁的时间间隔（毫秒）
unsigned long currentMillis=0;
RTC rtc;
DateTime dateTime = {2019, 12, 1, 18, 11, 23, 20};
uint16_t tYear;
uint8_t tMonth, tWeekday, tDay, tHour, tMinute, tSecond; 
Tem_Hum_S2  thermo; //调用Sensor-Tem&Hum传感器

void TemRead();
#define INTERVAL_LCD 20 //定义OLED刷新时间间隔 
unsigned long lcd_time = millis(); //OLED刷新时间计时器
U8GLIB_SSD1306_128X64 u8g(U8G_I2C_OPT_NONE); //设置OLED型号 
//-------字体设置，大、中、小
#define setFont_L u8g.setFont(u8g_font_7x13)
#define setFont_M u8g.setFont(u8g_font_osb21)
#define setFont_S u8g.setFont(u8g_font_fixed_v0r)

void setup() {
 Wire.begin();
 Serial.begin(9600);
 pinMode(PIN_KEY, INPUT);//设置触摸输入状态
 thermo.begin();
  rtc.begin();
  rtc.clearAll();
  //设置启动时间
  rtc.setDateTime(dateTime);
  WifiInit(EspSerial, UARTSPEED);

}


void loop() {
 TemRead();//调用自定义函数
  rtc.getDateTime(&dateTime);
   currentMillis = millis();//读取系统计时器
 u8g.firstPage();//u8glib规定的写法
  if(currentMillis-previousMillis>interval)
   {
    do {
 setFont_L;//选择字体
 u8g.drawStr(0,0, "");
 }while( u8g.nextPage() );//u8glib规定的写法
   }

   else
   {
   do {
 setFont_L;//选择字体
u8g.setPrintPos(0, 10);//选择位置
u8g.print("temperature:");//打印字符串
u8g.setPrintPos(0, 30);//选择位置
u8g.print(sensor_tem);//打印温度
u8g.setPrintPos(44, 30);//选择位置
u8g.print("C");//打印温度
setFont_S;//选择字体
u8g.setPrintPos(38, 23);//选择位置
u8g.print("o");//打印字符串
setFont_L;//选择字体
u8g.setPrintPos(0, 45);//选择位置
u8g.print("time:");//打印温度
 
 
 setFont_S;                                  //输出时钟数据
    u8g.setPrintPos(0, 60);
  u8g.print(dateTime.year);
  u8g.setPrintPos(25, 60);
  u8g.print(".");
    u8g.setPrintPos(30, 60);
  u8g.print(dateTime.month);
   u8g.setPrintPos(45, 60);
  u8g.print(".");
    u8g.setPrintPos(50, 60);
  u8g.print(dateTime.day);
   u8g.setPrintPos(60, 60);
  u8g.print(".");
  u8g.setPrintPos(65, 60);
  u8g.print(dateTime.hour);
   u8g.setPrintPos(80, 60);
  u8g.print(".");
  u8g.setPrintPos(85, 60);
  if (dateTime.minute < 10)
  {
    u8g.print("0");
    u8g.print(dateTime.minute);
  }
  else
    u8g.print(dateTime.minute);
 }while( u8g.nextPage() );//u8glib规定的写法

    }
 if (digitalRead(PIN_KEY))  //检测按键状态
  {
   
  }
  else
  { previousMillis = currentMillis; //清零清醒时间
  do {
 setFont_L;//选择字体
u8g.setPrintPos(0, 10);//选择位置
u8g.print("temperature:");//打印字符串
u8g.setPrintPos(0, 30);//选择位置
u8g.print(sensor_tem);//打印温度
u8g.setPrintPos(44, 30);//选择位置
u8g.print("C");//打印温度
setFont_S;//选择字体
u8g.setPrintPos(38, 23);//选择位置
u8g.print("o");//打印字符串
setFont_L;//选择字体
u8g.setPrintPos(0, 45);//选择位置
u8g.print("time:");//打印温度
 
 
 setFont_S;                                  //输出时钟数据
    u8g.setPrintPos(0, 60);
  u8g.print(dateTime.year);
  u8g.setPrintPos(25, 60);
  u8g.print(".");
  u8g.print(dateTime.month);
   u8g.setPrintPos(45, 60);
  u8g.print(".");
    u8g.setPrintPos(50, 60);
  u8g.print(dateTime.day);
   u8g.setPrintPos(60, 60);
  u8g.print(".");
  u8g.setPrintPos(65, 60);
  u8g.print(dateTime.hour);
   u8g.setPrintPos(80, 60);
  u8g.print(".");
  u8g.setPrintPos(85, 60);
  if (dateTime.minute < 10)
  {
    u8g.print("0");
    u8g.print(dateTime.minute);
  }
  else
    u8g.print(dateTime.minute);
 }while( u8g.nextPage() );//u8glib规定的写法

}                                                         //直到这里都是led输出，用触摸开关唤醒的功能，经验证是合理的
if (sensor_time > millis())  sensor_time = millis();  
    
  if(millis() - sensor_time > INTERVAL_SENSOR)              //传感器采样时间间隔  
  {  
    getSensorData();                                        //读串口中的传感器数据
    sensor_time = millis();
  }  

    
  if (net_time1 > millis())  net_time1 = millis();
  
  if (millis() - net_time1 > INTERVAL_NET)                  //发送数据时间间隔
  {                
    updateSensorData();                                     //将数据上传到服务器的函数
    net_time1 = millis();
  }

}
void TemRead()
{
  sensor_tem = thermo.getTemperature();//把获得的温度值赋给变量sensor_tem
  ;
}                                                                                                               /*温度传感器部分*/


void getSensorData(){  
  sensor_tem = thermo.getTemperature();//把获得的温度值赋给变量sensor_tem
    dtostrf(sensor_tem, 2, 1, sensor_tem_c);
   
}
void updateSensorData() {
  if (wifi.createTCP(HOST_NAME, HOST_PORT)) { //建立TCP连接，如果失败，不能发送该数据
    Serial.print("create tcp ok\r\n");

jsonToSend="{\"Temperature\":";
    dtostrf(sensor_tem,1,2,buf);
    jsonToSend+="\""+String(buf)+"\"";
    jsonToSend+="}";
    



    postString="POST /devices/";
    postString+=DEVICEID;
    postString+="/datapoints?type=3 HTTP/1.1";
    postString+="\r\n";
    postString+="api-key:";
    postString+=apiKey;
    postString+="\r\n";
    postString+="Host:api.heclouds.com\r\n";
    postString+="Connection:close\r\n";
    postString+="Content-Length:";
    postString+=jsonToSend.length();
    postString+="\r\n";
    postString+="\r\n";
    postString+=jsonToSend;
    postString+="\r\n";
    postString+="\r\n";
    postString+="\r\n";

  const char *postArray = postString.c_str();                 //将str转化为char数组
  Serial.println(postArray);
  wifi.send((const uint8_t*)postArray, strlen(postArray));    //send发送命令，参数必须是这两种格式，尤其是(const uint8_t*)
  Serial.println("send success");   
     if (wifi.releaseTCP()) {                                 //释放TCP连接
        Serial.print("release tcp ok\r\n");
        } 
     else {
        Serial.print("release tcp err\r\n");
        }
      postArray = NULL;                                       //清空数组，等待下次传输数据
  
  } else {
    Serial.print("create tcp err\r\n");
  }
}
