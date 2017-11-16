package p04.set;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**[List 컬렉션]
 * Set - HashSet
 * -.Set: 자료를 중복저장하지 않는 자료구조, 순서가 없음
 **/
public class HashSetExample {
	public static void main(String[] args) {
		//Set객체 생성
		Set<String> set = new HashSet<>(); //HashSet 객체 생성 후 Promotion
		set.add("Java");
		set.add("JDBC");
		set.add("Servlet/JSP");
		set.add("Java"); //동일한 객체의 중복저장은 안됨
		set.add("iBatis");
		
		int size = set.size();//저장된 객체의 갯수
		System.out.println("총 객체의 갯수: "+ size);
		
		Set<Integer> set2 = new HashSet<>();
		set2.add(new Integer(1)); //객체저장 Wrapper클래스
		set2.add(1); //int타입의 정수 → Wrapper클래스: auto-Boxing
		set2.add(2);
		set2.add(new Integer(3));
		
		System.out.println("총 객체의 갯수: " + set2.size());
		
		//set에서 자료를 얻어내기위해서 반복자를 생성
		Iterator<String> iterator = set.iterator();  //iterator(): 저장된 객체들의 순서와 번지정보를 만들어서 Iterator객체에 저장하는 메소드
		while(iterator.hasNext()) { //hasNext(): 자료가 있는지 여부를 확인하는 메소드
			String el = iterator.next(); //next(): 값을 가져오는 메소드
			System.out.print("\t"+el);
		}
		System.out.println();
		//set2의 정보를 출력
		Iterator<Integer> iterator2 = set2.iterator();
		while(iterator2.hasNext()) {
			Integer numb = iterator2.next();
//			String el = String.valueOf(iterator2.next());
			System.out.print(numb+"\t");
		}
		System.out.println();
		
	}
}
