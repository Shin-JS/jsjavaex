package p11.calendar;

import java.util.Calendar;

/**[API]
 * -.Calendar는 달력정보를 가지고 있는 객체
 * -.Calendar의 날짜정보는 pc의 system타임을 근거로 함
 **/
public class CalendarExample {
	public static void main(String[] args) {
		//singleton: 생성자를 private로 막아서 외부에서 생성을 하지 못하게 하고, getInstance()메소드로 객체를 전달하는 방식(데이터의 오류를 막기 위함)
		Calendar now = Calendar.getInstance();
		
		int year = now.get(Calendar.YEAR); //년
		int month = now.get(Calendar.MONTH)+1; //월
		int day = now.get(Calendar.DAY_OF_MONTH); //일
		int weekDay = now.get(Calendar.DAY_OF_WEEK); //요일
		String str = null;
		switch(weekDay) {
		case 1: str = "일"; break;
		case 2: str = "월"; break;
		case 3: str = "화"; break;
		case 4: str = "수"; break;
		case 5: str = "목"; break;
		case 6: str = "금"; break;
		case 7: str = "토"; break;
		}
		int amPm = now.get(Calendar.AM_PM);
		String strAmPm = null;
		strAmPm = (amPm==0)? "오전":"오후";
		int hour = now.get(Calendar.HOUR);
		int minute = now.get(Calendar.MINUTE);
		int second = now.get(Calendar.SECOND);
		System.out.println(year+"년"+month+"월"+day+"일"+str+"요일"+strAmPm+hour+"시"+minute+"분"+second+"초");
		
	}
}
