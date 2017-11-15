package p12.format;

import java.text.SimpleDateFormat;
import java.util.Date;

/**[API]
 * 
 **/
public class SimpleDateformatExample {
	public static void main(String[] args) {
		Date now = new Date(); //날짜객체 생성
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		System.out.println(sdf.format(now));
		
		sdf = new SimpleDateFormat("yyyy년 MM월 dd일");
		System.out.println(sdf.format(now));
		
		sdf = new SimpleDateFormat("yyyy.MM.dd a HH:mm:ss");
		System.out.println(sdf.format(now));
		
		sdf = new SimpleDateFormat("오늘은 E요일");
		System.out.println(sdf.format(now));
		
		sdf = new SimpleDateFormat("오늘은 올해의 D번째 날");
		System.out.println(sdf.format(now));
		
		sdf = new SimpleDateFormat("오늘은 이달의 d번째 날");
		System.out.println(sdf.format(now));
		
	}
}
