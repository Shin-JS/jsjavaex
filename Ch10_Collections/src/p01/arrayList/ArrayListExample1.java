package p01.arrayList;

import java.util.ArrayList;

/**[List 컬렉션]
 * ArrayList
 * -.Collections: 객체를 가변적으로 저장할 수 있는 자료구조의 형태
 * -.List계열-ArrayList: 배열과 비슷한 구조의 자료구조형태, 크기가 정해져있지 않고, 가변적으로 늘어나는형태
 *  .add()추가, get(index) 검색, remove(index)삭제
 **/
public class ArrayListExample1 {
	public static void main(String[] args) {
		//ArrayList객체 생성
		ArrayList<String> myStringArrays = new ArrayList<>();
		myStringArrays.add("안녕0"); //add(객체)-객체를 추가
		myStringArrays.add("안녕1");
		myStringArrays.add("안녕2");
		myStringArrays.add("안녕3");
		myStringArrays.add("안녕4");
		myStringArrays.add("안녕5");
		myStringArrays.add("안녕6");
		myStringArrays.add("안녕7");
		//get(index번호); - 특정위치의 값 리턴
		String str1 = myStringArrays.get(1); //index번지 1의 값을 출력
		
		for(String s:myStringArrays){//for-each문
			System.out.println(s); //출력
		}
		System.out.println("================");
		//삭제
		myStringArrays.remove(0);
		
		for(String s:myStringArrays){//for-each문
			System.out.println(s); //출력
		}
		
		
	}
	
}
