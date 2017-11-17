package p08.compare;

import java.util.Iterator;
import java.util.TreeSet;

/**[2진트리]
 * 객체 저장
 * Comparable인터페이스 구현
 **/
public class ComparableExample {
	public static void main(String[] args) {
		TreeSet<Person> treeSet = new TreeSet<>();
		
		treeSet.add(new Person("홍길동",45));
		treeSet.add(new Person("일지매",25));
		treeSet.add(new Person("임꺽정",31));
		
		Iterator<Person> iterator = treeSet.iterator();
		while(iterator.hasNext()) {
			Person person = iterator.next();
			System.out.println(person.name+":"+person.age);
		}
		
	}
}
