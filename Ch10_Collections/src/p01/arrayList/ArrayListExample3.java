package p01.arrayList;

import java.util.ArrayList; //클래스
import java.util.List; //인터페이스

/**[List 컬렉션]
 * ArrayList
 * -.List는 모든객체를 다 저장할 수 있다. (하지만 잘 안씀)	
 **/
public class ArrayListExample3 {
	public static void main(String[] args) {
		List list = new ArrayList();
		//Object[]
		list.add(10);
		list.add("홍길동");
		list.add(3.141592);
		list.add(10e-1);
		list.add(new Student());
		
		for(int i = 0; i<list.size();i++) {
			System.out.println(list.get(i));
			
		}
		
		
		
	}
}
class Student{}
