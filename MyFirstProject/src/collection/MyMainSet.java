package collection;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class MyMainSet {
	public static void main(String[] args) {
		
		//입력순서랑 상관x,중복x
		Set set = new HashSet();
		
		set.add(5);
		set.add(3);
		set.add(1);
		set.add(5);
		
		Iterator iter = set.iterator();
		while (iter.hasNext()) {
			System.out.println(iter.next());
		}
		
		System.out.println(set.contains(3));
		System.out.println(set.remove(3));
		System.out.println(set.size());
	}
}
