package p08.compare;

import java.util.Iterator;
import java.util.TreeSet;

/**[2진트리]
 * 객체 저장
 * comparator사용
 **/
public class ComparatorExample {
	public static void main(String[] args) {
		TreeSet<Fruit> treeSet = new TreeSet<>(new DescendigComparator()); //객체간의 비교를 위해 comparator를 매개변수로 넣어줌
		treeSet.add(new Fruit("포도",3000));
		treeSet.add(new Fruit("수박",10000));
		treeSet.add(new Fruit("딸기",6000));
		
		Iterator<Fruit> iterator = treeSet.iterator();
		while(iterator.hasNext()) {
			Fruit fruit = iterator.next();
			System.out.println(fruit.name+":"+fruit.price);
		}
		
	}
}
