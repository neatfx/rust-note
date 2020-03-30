#[cfg(test)]
mod tests {
    use std::sync::{Mutex, Arc};
    use std::thread;

    // 使用 Arc<T> 对 Mutex<T> 进行包装，实现在多线程间正确共享所有权
    #[test]
    fn use_moved_value() {
        let counter = Arc::new(Mutex::new(0));
        let mut handles = vec![];
    
        for _ in 0..10 {
            let counter = Arc::clone(&counter);
            let handle = thread::spawn(move || {
                let mut num = counter.lock().unwrap();
    
                *num += 1;
            });
            handles.push(handle);
        }
    
        for handle in handles {
            handle.join().unwrap();
        }
    
        assert_eq!(10, *counter.lock().unwrap());
    }
}