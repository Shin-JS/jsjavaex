package p01.arrayList;

import java.util.Arrays;
import java.util.List;

/**[List 컬렉션]
 * ArrayList
 **/
public class ArrayListExample4 {
	public static void main(String[] args) {
		//입력받은 초기값으로 List를 만드는 메소드 = Arrays.asList(T ... s);
		//메소드: 리턴타입 메소드명(매개변수){실행부;}
		//입력되는 매개변수의 갯수를 알 수 없을때(T ... s)형태로 표시, 입력되는 타입의 갯수에 따라 배열이 만들어짐
		//String[] str = {"값1","값2","값3"};
		//Arrays.asList(str);
		List<String> list = Arrays.asList/*입력받은 문자열을 List형태로 만들어주는 메소드*/("홍길동","일지매","임꺽정");
		for(String name:list) {
			System.out.println(name);
		}
		
		//초기값으로 리스트를 만들때 Arrays.asList(배열); 을 사용하면 편하다
		String[] str = {"파이썬","아나콘다","보아"};
		List<String> list1 = Arrays.asList(str);
		for(String s:list1) {
			System.out.println(s);
		}
		
		//초기값을 숫자형으로 리스트를 만들때, Arrays.asList(배열);
		Integer[] ints = {1,2,3};
		List<Integer> list2 = Arrays.asList(ints);
		for(int v:list2) {
			System.out.println(v);
		}
		
		
		
	}
}
