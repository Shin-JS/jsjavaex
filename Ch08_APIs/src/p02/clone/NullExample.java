package p02.clone;

import java.util.Objects;

/**[API]
 * Objects의 requireNull 
 **/
public class NullExample {
	public static void main(String[] args) {
		String str1 = "고길동";
		String str2 = null;
		//requireNonNull(객체): 객체가 null이 아니면 객체의 내용 출력
		System.out.println(Objects.requireNonNull(str1));
		try {
		//객체가 null이면 NullPointerException을 출력
		System.out.println(Objects.requireNonNull(str2)); //null인경우 오류발생됨
		}catch(NullPointerException e) {
			System.out.println(e.getMessage());
		}
		
		try {
			String name = Objects.requireNonNull(str2,"이름이 없습니다.");
		}catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
